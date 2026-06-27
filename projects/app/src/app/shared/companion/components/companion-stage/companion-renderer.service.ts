import { Injectable } from '@angular/core';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  CompanionAnimationConfig,
  CompanionAnimationName,
  CompanionLightingPreset,
  CompanionStageFraming,
} from '../../models/companion-animation.model';

@Injectable()
export class CompanionRendererService {
  private readonly loader = new GLTFLoader();
  private readonly clock = new Clock();

  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private model: Group | null = null;
  private mixer: AnimationMixer | null = null;
  private frameId: number | null = null;
  private hair: Group | null = null;

  private readonly actions = new Map<CompanionAnimationName, AnimationAction>();
  private currentAction: AnimationAction | null = null;
  private finishedHandler: ((event: { action: AnimationAction }) => void) | null = null;

  private readonly lights: Object3D[] = [];
  private lightTarget: Object3D | null = null;

  async init(host: HTMLElement, config: CompanionAnimationConfig): Promise<void> {
    this.createScene(host, config.framing ?? 'full-body');
    await this.loadModel(config.modelUrl, config.framing ?? 'full-body');
    if (config.hairUrl) {
      await this.loadHair(config.hairUrl);
    }

    await this.loadAnimations(config.animations);

    this.playLoop('idle');
    this.startRenderLoop();
  }

  resize(host: HTMLElement): void {
    if (!this.camera || !this.renderer) {
      return;
    }

    const { width, height } = this.getHostSize(host);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  playLoop(name: CompanionAnimationName): void {
    const nextAction = this.actions.get(name);

    if (!nextAction || nextAction === this.currentAction) {
      return;
    }

    this.clearFinishedHandler();

    nextAction
      .reset()
      .setLoop(LoopRepeat, Infinity)
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(0.25)
      .play();

    this.currentAction?.fadeOut(0.25);
    this.currentAction = nextAction;
  }

  playOnce(name: CompanionAnimationName, fallback: CompanionAnimationName = 'idle'): void {
    const nextAction = this.actions.get(name);

    console.log('[Companion] playOnce requested', {
      name,
      fallback,
      exists: Boolean(nextAction),
      available: Array.from(this.actions.keys()),
    });

    if (!nextAction) {
      this.playLoop(fallback);
      return;
    }

    this.clearFinishedHandler();

    this.currentAction?.fadeOut(0.15);

    nextAction.clampWhenFinished = true;

    nextAction
      .reset()
      .setLoop(LoopOnce, 1)
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(0.12)
      .play();

    this.currentAction = nextAction;

    this.finishedHandler = (event) => {
      if (event.action !== nextAction) {
        return;
      }

      this.clearFinishedHandler();
      this.playLoop(fallback);
    };

    this.mixer?.addEventListener('finished', this.finishedHandler);
  }

  dispose(): void {
    this.clearFinishedHandler();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.actions.clear();
    this.currentAction = null;

    this.renderer?.dispose();

    if (this.renderer?.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.mixer = null;
  }

  private createScene(host: HTMLElement, framing: CompanionStageFraming): void {
    this.scene = new Scene();

    const { width, height } = this.getHostSize(host);

    this.camera = new PerspectiveCamera(32, width / height, 0.1, 100);

    const cameraPosition = this.getCameraPosition(framing);
    const lookAt = this.getLookAt(framing);

    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookAt);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.inset = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    this.renderer.setSize(width, height, false);

    host.appendChild(this.renderer.domElement);

    this.applyLightingPreset('day');
  }

  setLightingPreset(preset: CompanionLightingPreset): void {
    if (!this.scene || !this.renderer) {
      return;
    }

    this.applyLightingPreset(preset);
  }

  private applyLightingPreset(preset: CompanionLightingPreset): void {
    if (!this.scene || !this.renderer) {
      return;
    }

    this.clearLights();

    this.lightTarget = new Object3D();
    this.lightTarget.position.set(0, 0.85, 0);
    this.scene.add(this.lightTarget);

    if (preset === 'day') {
      this.applyDayLighting();
      return;
    }

    this.applyNightStudioLighting();
  }

  private applyDayLighting(): void {
    if (!this.scene || !this.renderer || !this.lightTarget) {
      return;
    }

    this.renderer.toneMappingExposure = 1.22;

    const lime = this.hsl(84, 100, 62);
    const mint = this.hsl(165, 75, 72);
    const blue = this.hsl(205, 80, 76);
    const warmSun = this.hsl(42, 100, 86);
    const softSky = this.hsl(190, 70, 92);

    /**
     * Ambiance générale claire mais pas grise.
     * Le sky est très lumineux, le sol légèrement mint.
     */
    const hemisphere = new HemisphereLight(softSky, this.hsl(155, 34, 78), 1.05);

    /**
     * Key light = soleil principal.
     * Plus chaud, plus fort, plus haut.
     */
    const sunKeyLight = new DirectionalLight(warmSun, 4.4);
    sunKeyLight.position.set(3.8, 5.8, 4.8);
    sunKeyLight.castShadow = true;

    /**
     * Fill light = adoucissement côté opposé.
     * Mint très léger, pour rester dans la palette Trajectiv.
     */
    const mintFillLight = new DirectionalLight(mint, 0.78);
    mintFillLight.position.set(-3.4, 2.5, 3.2);

    /**
     * Blue bounce = reflet doux venant du bas/fond,
     * inspiré du gradient bleu light.
     */
    const blueBounceLight = new PointLight(blue, 1.15, 5.8, 2);
    blueBounceLight.position.set(1.8, 0.35, 2.4);

    /**
     * Backlight = séparation du personnage avec le fond.
     * Blanc/mint doux, pas trop visible.
     */
    const backLight = new SpotLight(this.hsl(165, 80, 88), 3.2, 9, Math.PI / 7, 0.42, 1.55);
    backLight.position.set(-2.6, 3.4, -3.8);
    backLight.target = this.lightTarget;

    /**
     * Accent lime ponctuel.
     * Il ne doit pas éclairer toute la scène,
     * juste ajouter une signature Trajectiv.
     */
    const limeAccentLight = new SpotLight(lime, 1.65, 5.2, Math.PI / 12, 0.35, 1.85);
    limeAccentLight.position.set(2.1, 1.45, 2.3);
    limeAccentLight.target = this.lightTarget;

    this.addLights(
      hemisphere,
      sunKeyLight,
      mintFillLight,
      blueBounceLight,
      backLight,
      limeAccentLight,
    );
  }

  private applyNightStudioLighting(): void {
    if (!this.scene || !this.renderer || !this.lightTarget) {
      return;
    }

    this.renderer.toneMappingExposure = 1.12;

    const lime = this.hsl(84, 100, 58);
    const mint = this.hsl(165, 72, 52);
    const blue = this.hsl(205, 78, 58);
    const violet = this.hsl(260, 70, 62);

    // Ambiance minimale : évite le rendu gris diffus.
    const ambient = new AmbientLight(0x06100c, 0.08);

    // Très léger ciel froid / sol sombre, juste pour garder du volume.
    const hemisphere = new HemisphereLight(blue, 0x050706, 0.18);

    // Key light : mint/white premium, concentrée sur le visage et le torse.
    const keyLight = new SpotLight(this.hsl(155, 45, 88), 5.8, 8, Math.PI / 10, 0.32, 1.8);
    keyLight.position.set(2.8, 3.9, 4.1);
    keyLight.target = this.lightTarget;
    keyLight.castShadow = true;

    // Fill light : bleu doux, faible, pour ne pas griser toute la scène.
    const fillLight = new SpotLight(blue, 1.15, 7, Math.PI / 12, 0.5, 2);
    fillLight.position.set(-3.4, 2.0, 3.1);
    fillLight.target = this.lightTarget;

    // Back light : lime Trajectiv, plus ponctuelle, détache la silhouette.
    const backLight = new SpotLight(lime, 7.8, 8, Math.PI / 13, 0.22, 1.55);
    backLight.position.set(-2.4, 3.1, -3.6);
    backLight.target = this.lightTarget;

    // Rim light : violet, côté opposé, effet studio/magique.
    const violetRimLight = new SpotLight(violet, 3.8, 6.5, Math.PI / 14, 0.26, 1.7);
    violetRimLight.position.set(2.8, 2.25, -2.7);
    violetRimLight.target = this.lightTarget;

    // Point lights colorés : petits accents lumineux, plus ponctuels.
    const limePoint = new PointLight(lime, 1.8, 3.8, 2);
    limePoint.position.set(-1.4, 1.4, 1.7);

    const bluePoint = new PointLight(blue, 1.25, 3.6, 2);
    bluePoint.position.set(1.6, 0.7, 2.0);

    const violetPoint = new PointLight(violet, 1.15, 3.4, 2);
    violetPoint.position.set(-1.8, 0.55, 1.2);

    this.addLights(
      ambient,
      hemisphere,
      keyLight,
      fillLight,
      backLight,
      violetRimLight,
      limePoint,
      bluePoint,
      violetPoint,
    );
  }

  private hsl(hue: number, saturation: number, lightness: number): Color {
    return new Color().setHSL(hue / 360, saturation / 100, lightness / 100);
  }

  private addLights(...lights: Object3D[]): void {
    if (!this.scene) {
      return;
    }

    for (const light of lights) {
      this.scene.add(light);
      this.lights.push(light);

      if (light instanceof SpotLight && light.target) {
        this.scene.add(light.target);
      }
    }
  }

  private clearLights(): void {
    if (!this.scene) {
      return;
    }

    for (const light of this.lights) {
      this.scene.remove(light);

      if (light instanceof SpotLight && light.target) {
        this.scene.remove(light.target);
      }
    }

    this.lights.length = 0;

    if (this.lightTarget) {
      this.scene.remove(this.lightTarget);
      this.lightTarget = null;
    }
  }

  private async loadModel(url: string, framing: CompanionStageFraming): Promise<void> {
    const gltf = await this.loadGltf(url);

    this.model = gltf.scene;
    this.model.rotation.set(0, 0, 0);
    this.fitModelToStage(this.model, framing);

    this.scene?.add(this.model);
    this.logBones(this.model);

    this.mixer = new AnimationMixer(this.model);

    this.registerClips(gltf.animations, 'idle');
  }

  private async loadHair(url: string): Promise<void> {
    console.log('[Companion] loading hair', url);

    if (!this.model) {
      console.warn('[Companion] cannot load hair: model missing');
      return;
    }

    const gltf = await this.loadGltf(url);

    console.log('[Companion] hair gltf loaded', {
      url,
      scene: gltf.scene.name,
      children: gltf.scene.children.map((child) => child.name),
    });

    this.hair = gltf.scene;
    this.hair.name = 'TR_HAIR_PREVIEW';

    /**
     * Étape 1 :
     * On l’ajoute d’abord au model root pour qu’il soit dans le même repère
     * que le personnage déjà fit/scalé.
     */
    this.model.add(this.hair);

    /**
     * Important avant attach :
     * On force la mise à jour des matrices monde.
     */
    this.model.updateMatrixWorld(true);
    this.hair.updateMatrixWorld(true);

    const headBone = this.findHeadBone(this.model);

    if (!headBone) {
      console.warn('[Companion] no head bone found, hair remains attached to model root');
      return;
    }

    headBone.updateMatrixWorld(true);

    this.hair.traverse((object) => {
      object.frustumCulled = false;

      if (object instanceof Mesh) {
        object.material = new MeshStandardMaterial({
          color: 0x9dff57,
          roughness: 0.72,
          metalness: 0,
        });

        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    /**
     * Étape 2 :
     * Re-parent au bone de tête en conservant la position monde.
     */
    headBone.attach(this.hair);

    console.log('[Companion] hair attached to head bone', {
      bone: headBone.name,
      hairPosition: this.hair.position.toArray(),
      hairRotation: this.hair.rotation.toArray(),
      hairScale: this.hair.scale.toArray(),
    });
  }

  private logBones(root: Object3D): void {
    const bones: string[] = [];

    root.traverse((object) => {
      if (object instanceof Bone) {
        bones.push(object.name);
      }
    });

    console.log('[Companion] bones', bones);
  }

  private findHeadBone(root: Object3D): Bone | null {
    const candidates: Bone[] = [];

    root.traverse((object) => {
      if (!(object instanceof Bone)) {
        return;
      }

      const name = object.name.toLowerCase();

      if (name === 'head' || name.includes('head') || name.includes('skull')) {
        candidates.push(object);
      }
    });

    console.log(
      '[Companion] head bone candidates',
      candidates.map((bone) => bone.name),
    );

    return (
      candidates.find((bone) => {
        const name = bone.name.toLowerCase();

        return name === 'head' || name.endsWith('head') || name.includes('mixamorighead');
      }) ??
      candidates[0] ??
      null
    );
  }

  private async loadAnimations(animations: Record<CompanionAnimationName, string>): Promise<void> {
    const entries = Object.entries(animations) as Array<[CompanionAnimationName, string]>;

    for (const [name, url] of entries) {
      const gltf = await this.loadGltf(url);

      console.log('[Companion] loaded animation', {
        name,
        url,
        clips: gltf.animations.map((clip) => ({
          name: clip.name,
          duration: clip.duration,
          tracks: clip.tracks.length,
        })),
      });

      this.registerClips(gltf.animations, name);
    }

    console.log('[Companion] registered actions', Array.from(this.actions.keys()));
  }

  private registerClips(clips: AnimationClip[], name: CompanionAnimationName): void {
    if (!this.mixer || clips.length === 0) {
      return;
    }

    const clip = this.findBestClip(clips, name);

    if (!clip) {
      return;
    }

    console.log('[Companion] registered clip', {
      actionName: name,
      clipName: clip.name,
      duration: clip.duration,
      tracks: clip.tracks.length,
    });

    const action = this.mixer.clipAction(clip);
    this.actions.set(name, action);
  }

  private findBestClip(
    clips: AnimationClip[],
    actionName: CompanionAnimationName,
  ): AnimationClip | null {
    const usefulClips = clips.filter((clip) => {
      return clip.duration > 0.2 && clip.tracks.length > 0;
    });

    if (usefulClips.length === 0) {
      return clips[0] ?? null;
    }

    if (actionName === 'idle') {
      return this.findLongestClip(usefulClips);
    }

    return usefulClips.at(-1) ?? null;
  }

  private findLongestClip(clips: AnimationClip[]): AnimationClip | null {
    return clips.reduce<AnimationClip | null>((longestClip, clip) => {
      if (!longestClip) {
        return clip;
      }

      return clip.duration > longestClip.duration ? clip : longestClip;
    }, null);
  }

  private normalizeAnimationName(value: string): string {
    return value.toLowerCase().replaceAll('-', '').replaceAll('_', '').replaceAll(' ', '');
  }

  private loadGltf(url: string): Promise<GLTF> {
    return this.loader.loadAsync(url);
  }

  private startRenderLoop(): void {
    const render = (): void => {
      this.frameId = requestAnimationFrame(render);

      const delta = this.clock.getDelta();
      this.mixer?.update(delta);

      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    render();
  }

  private clearFinishedHandler(): void {
    if (!this.finishedHandler) {
      return;
    }

    this.mixer?.removeEventListener('finished', this.finishedHandler);
    this.finishedHandler = null;
  }
  private fitModelToStage(model: Group, framing: CompanionStageFraming): void {
    const box = new Box3().setFromObject(model);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension <= 0) {
      return;
    }

    const targetHeight = this.getTargetHeight(framing);
    const scale = targetHeight / size.y;

    model.scale.setScalar(scale);

    const scaledBox = new Box3().setFromObject(model);
    const scaledCenter = new Vector3();
    const scaledSize = new Vector3();

    scaledBox.getCenter(scaledCenter);
    scaledBox.getSize(scaledSize);

    model.position.x -= scaledCenter.x;
    model.position.y -= scaledBox.min.y;
    model.position.z -= scaledCenter.z;

    model.position.y -= 1.18;
  }

  private getTargetHeight(framing: CompanionStageFraming): number {
    switch (framing) {
      case 'portrait':
        return 4.2;

      case 'hero':
        return 3.1;

      case 'full-body':
        return 2.55;
    }
  }

  private getCameraPosition(framing: CompanionStageFraming): Vector3 {
    switch (framing) {
      case 'portrait':
        return new Vector3(0, 1.35, 3.3);

      case 'hero':
        return new Vector3(0, 1.2, 4.4);

      case 'full-body':
        return new Vector3(0, 1.15, 5.4);
    }
  }

  private getLookAt(framing: CompanionStageFraming): Vector3 {
    switch (framing) {
      case 'portrait':
        return new Vector3(0, 1.35, 0);

      case 'hero':
        return new Vector3(0, 0.65, 0);

      case 'full-body':
        return new Vector3(0, 0.35, 0);
    }
  }
  private getHostSize(host: HTMLElement): { width: number; height: number } {
    const rect = host.getBoundingClientRect();

    return {
      width: Math.max(Math.round(rect.width), 1),
      height: Math.max(Math.round(rect.height), 1),
    };
  }
}
