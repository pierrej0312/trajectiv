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
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  RectAreaLight,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {
  CompanionAnimationConfig,
  CompanionAnimationName,
  CompanionAnimationSource,
  CompanionHairConfig,
  CompanionLightingPreset,
  CompanionSkinConfig,
  CompanionStageFraming,
} from '../../models/companion-animation.model';

type CompanionLoadingProgressCallback = (progress: number) => void;

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

  private readonly textureLoader = new TextureLoader();

  private currentConfig: CompanionAnimationConfig | null = null;
  private currentModelUrl: string | null = null;
  private currentHairUrl: string | null = null;
  private currentFraming: CompanionStageFraming = 'full-body';

  async applyConfig(config: CompanionAnimationConfig): Promise<void> {
    if (!this.scene || !this.model) {
      return;
    }

    const previousConfig = this.currentConfig;
    const nextFraming = config.framing ?? 'full-body';

    if (!previousConfig) {
      this.currentConfig = config;
      this.currentModelUrl = config.modelUrl;
      this.currentHairUrl = config.hair?.url ?? null;
      this.currentFraming = nextFraming;
      return;
    }

    if (config.modelUrl !== this.currentModelUrl) {
      await this.replaceModel(config);
      this.currentConfig = config;
      this.currentModelUrl = config.modelUrl;
      this.currentHairUrl = config.hair?.url ?? null;
      this.currentFraming = nextFraming;
      return;
    }

    if (nextFraming !== this.currentFraming) {
      this.fitModelToStage(this.model, nextFraming);
      this.updateCameraFraming(nextFraming);
      this.currentFraming = nextFraming;
    }

    if (config.skin && this.hasSkinChanged(previousConfig.skin, config.skin)) {
      await this.applySkinMaterial(config.skin);
    }

    if (this.hasHairModelChanged(previousConfig.hair, config.hair)) {
      await this.replaceHair(config.hair ?? null);
      this.currentHairUrl = config.hair?.url ?? null;
    } else if (config.hair && this.hasHairMaterialChanged(previousConfig.hair, config.hair)) {
      await this.applyExistingHairMaterial(config.hair);
    }

    this.currentConfig = config;
  }

  async init(
    host: HTMLElement,
    config: CompanionAnimationConfig,
    onProgress: CompanionLoadingProgressCallback = () => {},
  ): Promise<void> {
    onProgress(4);

    this.createScene(host, config.framing ?? 'full-body');
    onProgress(10);

    await this.loadModel(config.modelUrl, config.framing ?? 'full-body');
    onProgress(32);

    if (config.skin) {
      await this.applySkinMaterial(config.skin);
    }
    onProgress(48);

    if (config.hair) {
      await this.loadHair(config.hair);
    }
    onProgress(64);

    await this.loadAnimations(config.animations, onProgress);
    onProgress(96);

    this.startRenderLoop();

    if (config.intro?.animation) {
      this.playOnce(config.intro.animation, config.intro.fallback ?? 'idle');
    } else {
      this.playLoop('idle');
    }

    onProgress(100);

    this.currentConfig = config;
    this.currentModelUrl = config.modelUrl;
    this.currentHairUrl = config.hair?.url ?? null;
    this.currentFraming = config.framing ?? 'full-body';
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

    RectAreaLightUniformsLib.init();

    const { width, height } = this.getHostSize(host);

    this.camera = new PerspectiveCamera(32, width / height, 0.1, 100);

    const cameraPosition = this.getCameraPosition(framing);
    const lookAt = this.getLookAt(framing);

    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookAt);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
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

  async captureAvatarPreviewBlob(type = 'image/png', quality = 0.92): Promise<Blob> {
    if (!this.renderer || !this.scene || !this.camera || !this.model) {
      throw new Error('Companion renderer is not ready for avatar preview capture.');
    }

    const previousCameraPosition = this.camera.position.clone();
    const previousCameraQuaternion = this.camera.quaternion.clone();
    const previousCameraZoom = this.camera.zoom;
    const previousCameraNear = this.camera.near;
    const previousCameraFar = this.camera.far;

    const previousAction = this.currentAction;
    const previousMixerTimeScale = this.mixer?.timeScale ?? 1;

    try {
      this.freezeCompanionForCapture();

      this.frameCameraForAvatarPreview(this.model, this.camera);

      this.camera.updateProjectionMatrix();

      this.renderer.render(this.scene, this.camera);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      this.renderer.render(this.scene, this.camera);

      return await this.canvasToBlob(this.renderer.domElement, type, quality);
    } finally {
      this.camera.position.copy(previousCameraPosition);
      this.camera.quaternion.copy(previousCameraQuaternion);
      this.camera.zoom = previousCameraZoom;
      this.camera.near = previousCameraNear;
      this.camera.far = previousCameraFar;
      this.camera.updateProjectionMatrix();

      this.restoreCompanionAfterCapture(previousAction, previousMixerTimeScale);

      this.renderer.render(this.scene, this.camera);
    }
  }

  private freezeCompanionForCapture(): void {
    const idleAction = this.actions.get('idle');

    if (!this.mixer) {
      return;
    }

    this.clearFinishedHandler();

    if (idleAction) {
      for (const action of this.actions.values()) {
        if (action === idleAction) {
          continue;
        }

        action.stop();
      }

      idleAction.reset();
      idleAction.enabled = true;
      idleAction.paused = false;
      idleAction.time = 0;
      idleAction.setLoop(LoopRepeat, Infinity);
      idleAction.setEffectiveTimeScale(1);
      idleAction.setEffectiveWeight(1);
      idleAction.play();

      this.currentAction = idleAction;

      this.mixer.timeScale = 1;
      this.mixer.update(0);

      idleAction.paused = true;
      this.mixer.timeScale = 0;

      return;
    }

    this.mixer.timeScale = 0;
    this.mixer.update(0);
  }

  private restoreCompanionAfterCapture(
    previousAction: AnimationAction | null,
    previousMixerTimeScale: number,
  ): void {
    if (!this.mixer) {
      return;
    }

    for (const action of this.actions.values()) {
      action.paused = false;
    }

    this.mixer.timeScale = previousMixerTimeScale;

    if (previousAction && Array.from(this.actions.values()).includes(previousAction)) {
      previousAction.reset();
      previousAction.enabled = true;
      previousAction.paused = false;
      previousAction.setEffectiveTimeScale(1);
      previousAction.setEffectiveWeight(1);
      previousAction.play();

      this.currentAction = previousAction;
      return;
    }

    this.playLoop('idle');
  }

  private frameCameraForAvatarPreview(character: Object3D, camera: PerspectiveCamera): void {
    const box = new Box3().setFromObject(character);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    const target = new Vector3(center.x, box.min.y + size.y * 0.76, center.z);

    const frameHeight = size.y * 0.4;
    const fovRadians = (camera.fov * Math.PI) / 180;
    const distance = frameHeight / (2 * Math.tan(fovRadians / 2));

    camera.position.set(target.x, target.y, target.z + distance * 1.35);

    camera.lookAt(target);
    camera.near = 0.01;
    camera.far = 100;
  }

  private canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Avatar preview capture returned an empty blob.'));
            return;
          }

          resolve(blob);
        },
        type,
        quality,
      );
    });
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
    const ambient = new AmbientLight(0x06100c, 0.15);

    // Très léger ciel froid / sol sombre, juste pour garder du volume.
    const hemisphere = new HemisphereLight(blue, 0x050706, 0.18);

    // Key light : mint/white premium, concentrée sur le visage et le torse.
    const keyLight = new SpotLight(this.hsl(155, 45, 88), 4.2, 8, Math.PI / 10, 0.38, 1.8);
    keyLight.position.set(2.8, 3.9, 4.1);
    keyLight.target = this.lightTarget;
    keyLight.castShadow = true;

    const softboxKey = new RectAreaLight(this.hsl(150, 38, 88), 2.5, 3.2, 2.2);
    softboxKey.position.set(2.4, 2.4, 3.2);
    softboxKey.lookAt(0, 1.05, 0);

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
      softboxKey,
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
    this.logModelMaterials(this.model);

    this.mixer = new AnimationMixer(this.model);

    if (gltf.animations.length > 0) {
      console.warn('[Companion] base model animations ignored', {
        url,
        clips: gltf.animations.map((clip) => ({
          name: clip.name,
          duration: clip.duration,
          tracks: clip.tracks.length,
        })),
      });
    }
  }

  private async loadHair(config: CompanionHairConfig): Promise<void> {
    console.log('[Companion] loading hair', config);

    if (!this.model) {
      console.warn('[Companion] cannot load hair: model missing');
      return;
    }

    const gltf = await this.loadGltf(config.url);

    console.log('[Companion] hair gltf loaded', {
      url: config.url,
      scene: gltf.scene.name,
      children: gltf.scene.children.map((child) => child.name),
    });

    this.hair = gltf.scene;
    this.hair.name = 'TR_HAIR_PREVIEW';

    await this.applyHairMaterial(this.hair, config);

    this.model.add(this.hair);

    this.model.updateMatrixWorld(true);
    this.hair.updateMatrixWorld(true);

    if (config.attachTo === 'model') {
      console.log('[Companion] hair attached to model root');
      return;
    }

    const headBone = this.findHeadBone(this.model);

    if (!headBone) {
      console.warn('[Companion] no head bone found, hair remains attached to model root');
      return;
    }

    headBone.updateMatrixWorld(true);
    headBone.attach(this.hair);

    console.log('[Companion] hair attached to head bone', {
      bone: headBone.name,
      hairPosition: this.hair.position.toArray(),
      hairRotation: this.hair.rotation.toArray(),
      hairScale: this.hair.scale.toArray(),
    });
  }

  private async applyHairMaterial(hair: Group, config: CompanionHairConfig): Promise<void> {
    const material = await this.createHairMaterial(config);

    hair.traverse((object) => {
      object.frustumCulled = false;

      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      if (
        !config.debug &&
        object.material &&
        !config.detailMapUrl &&
        !config.normalMapUrl &&
        !config.roughnessMapUrl
      ) {
        return;
      }

      object.material = material;
    });
  }

  private async createHairMaterial(config: CompanionHairConfig): Promise<MeshStandardMaterial> {
    const material = new MeshStandardMaterial({
      color: config.color ?? '#4A2D1D',
      roughness: 0.9,
      metalness: 0,
    });

    if (config.detailMapUrl) {
      material.map = await this.loadColorTexture(config.detailMapUrl);
    }

    if (config.roughnessMapUrl) {
      material.roughnessMap = await this.loadDataTexture(config.roughnessMapUrl);
      material.roughness = 0.95;
    }

    if (config.normalMapUrl) {
      material.normalMap = await this.loadDataTexture(config.normalMapUrl);
      material.normalScale.set(0.35, 0.35);
    }

    material.needsUpdate = true;

    return material;
  }

  private async loadColorTexture(url: string): Promise<Texture> {
    const texture = await this.textureLoader.loadAsync(url);

    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;

    return texture;
  }

  private async loadDataTexture(url: string): Promise<Texture> {
    const texture = await this.textureLoader.loadAsync(url);

    texture.flipY = false;

    return texture;
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

  private async loadAnimations(
    animations: Record<CompanionAnimationName, CompanionAnimationSource>,
    onProgress: CompanionLoadingProgressCallback = () => {},
  ): Promise<void> {
    const entries = Object.entries(animations) as Array<
      [CompanionAnimationName, CompanionAnimationSource]
    >;

    const startProgress = 64;
    const endProgress = 96;
    const progressStep = (endProgress - startProgress) / Math.max(entries.length, 1);

    for (const [index, [name, source]] of entries.entries()) {
      const url = this.getAnimationUrl(source);
      const gltf = await this.loadGltf(url);

      console.log(
        `[Companion] clips for ${name}`,
        JSON.stringify(
          gltf.animations.map((clip, clipIndex) => ({
            index: clipIndex,
            name: clip.name,
            duration: Number(clip.duration.toFixed(3)),
            tracks: clip.tracks.length,
          })),
          null,
          2,
        ),
      );

      this.registerClips(gltf.animations, name, source);

      onProgress(Math.round(startProgress + progressStep * (index + 1)));
    }

    console.log('[Companion] registered actions', Array.from(this.actions.keys()));
  }

  private getAnimationUrl(source: CompanionAnimationSource): string {
    return typeof source === 'string' ? source : source.url;
  }

  private registerClips(
    clips: AnimationClip[],
    name: CompanionAnimationName,
    source?: CompanionAnimationSource,
  ): void {
    if (!this.mixer || clips.length === 0) {
      return;
    }

    const clip = this.findBestClip(clips, name, source);

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
    source?: CompanionAnimationSource,
  ): AnimationClip | null {
    const usefulClips = clips.filter((clip) => {
      return clip.duration > 0.2 && clip.tracks.length > 0;
    });

    const candidateClips = usefulClips.length > 0 ? usefulClips : clips;

    if (typeof source !== 'string' && source?.clipName) {
      const normalizedClipName = this.normalizeAnimationName(source.clipName);

      const clipByName = candidateClips.find((clip) => {
        return this.normalizeAnimationName(clip.name) === normalizedClipName;
      });

      if (clipByName) {
        return clipByName;
      }
    }

    if (typeof source !== 'string' && source?.clipIndex !== undefined) {
      return candidateClips[source.clipIndex] ?? candidateClips[0] ?? null;
    }

    if (actionName === 'idle') {
      return candidateClips[3] ?? candidateClips[0] ?? null;
    }

    return candidateClips.at(-1) ?? null;
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

  private async applySkinMaterial(config: CompanionSkinConfig): Promise<void> {
    if (!this.model) {
      return;
    }

    const skinMaterial = await this.createSkinMaterial(config);
    let appliedCount = 0;

    this.model.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => {
          if (!this.isSkinMaterialName(material.name)) {
            return material;
          }

          appliedCount += 1;
          return skinMaterial;
        });

        return;
      }

      if (!this.isSkinMaterialName(object.material.name)) {
        return;
      }

      object.material = skinMaterial;
      appliedCount += 1;
    });

    console.log('[Companion] skin material applied', {
      color: config.color,
      appliedCount,
    });
  }

  private isSkinMaterialName(name: string): boolean {
    const normalizedName = name
      .toLowerCase()
      .replaceAll('_', '')
      .replaceAll('-', '')
      .replaceAll(' ', '');

    return (
      normalizedName === 'trskin' ||
      normalizedName.includes('skin') ||
      normalizedName.includes('body') ||
      normalizedName.includes('female')
    );
  }

  private async createSkinMaterial(config: CompanionSkinConfig): Promise<MeshStandardMaterial> {
    const material = new MeshStandardMaterial({
      color: config.color,
      roughness: 0.86,
      metalness: 0,
    });

    material.name = 'TR_SKIN_RUNTIME';

    if (config.detailMapUrl) {
      material.map = await this.loadColorTexture(config.detailMapUrl);
    }

    if (config.roughnessMapUrl) {
      material.roughnessMap = await this.loadDataTexture(config.roughnessMapUrl);
      material.roughness = 0.9;
    }

    if (config.normalMapUrl) {
      material.normalMap = await this.loadDataTexture(config.normalMapUrl);
      material.normalScale.set(0.05, 0.05);
    }

    material.needsUpdate = true;

    return material;
  }

  private logModelMaterials(root: Object3D): void {
    const materials = new Set<string>();

    root.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          materials.add(material.name || '(unnamed material)');
        }

        return;
      }

      materials.add(object.material.name || '(unnamed material)');
    });

    console.log('[Companion] model materials', Array.from(materials));
  }

  private async replaceHair(config: CompanionHairConfig | null): Promise<void> {
    this.removeHair();

    if (!config) {
      return;
    }

    await this.loadHair(config);
  }

  private removeHair(): void {
    if (!this.hair) {
      return;
    }

    this.hair.parent?.remove(this.hair);
    this.disposeObject(this.hair);
    this.hair = null;
  }

  private async applyExistingHairMaterial(config: CompanionHairConfig): Promise<void> {
    if (!this.hair) {
      return;
    }

    await this.applyHairMaterial(this.hair, config);
  }

  private async replaceModel(config: CompanionAnimationConfig): Promise<void> {
    this.clearFinishedHandler();

    this.actions.clear();
    this.currentAction = null;

    this.removeHair();
    this.removeModel();

    await this.loadModel(config.modelUrl, config.framing ?? 'full-body');

    if (config.skin) {
      await this.applySkinMaterial(config.skin);
    }

    if (config.hair) {
      await this.loadHair(config.hair);
    }

    await this.loadAnimations(config.animations);

    this.playLoop('idle');
  }

  private removeModel(): void {
    if (!this.model) {
      return;
    }

    this.scene?.remove(this.model);
    this.disposeObject(this.model);

    this.model = null;
    this.mixer = null;
  }

  private disposeObject(object: Object3D): void {
    object.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        for (const material of child.material) {
          material.dispose();
        }

        return;
      }

      child.material.dispose();
    });
  }

  private updateCameraFraming(framing: CompanionStageFraming): void {
    if (!this.camera) {
      return;
    }

    const cameraPosition = this.getCameraPosition(framing);
    const lookAt = this.getLookAt(framing);

    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookAt);
    this.camera.updateProjectionMatrix();
  }

  hasSkinChanged(
    previous: CompanionSkinConfig | undefined,
    next: CompanionSkinConfig | undefined,
  ): boolean {
    return (
      previous?.color !== next?.color ||
      previous?.detailMapUrl !== next?.detailMapUrl ||
      previous?.normalMapUrl !== next?.normalMapUrl ||
      previous?.roughnessMapUrl !== next?.roughnessMapUrl
    );
  }

  hasHairModelChanged(
    previous: CompanionHairConfig | undefined,
    next: CompanionHairConfig | undefined,
  ): boolean {
    return previous?.url !== next?.url;
  }

  hasHairMaterialChanged(
    previous: CompanionHairConfig | undefined,
    next: CompanionHairConfig | undefined,
  ): boolean {
    return (
      previous?.color !== next?.color ||
      previous?.detailMapUrl !== next?.detailMapUrl ||
      previous?.normalMapUrl !== next?.normalMapUrl ||
      previous?.roughnessMapUrl !== next?.roughnessMapUrl
    );
  }
}
