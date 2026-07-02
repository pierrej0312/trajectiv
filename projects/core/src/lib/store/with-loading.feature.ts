import { signalStoreFeature, withMethods, withState } from '@ngrx/signals';

export interface LoadingFeatureState {
  loading: boolean;
  idle: boolean;
  ready: boolean;
  error: any;
}
export const withLoadingFeature = () => signalStoreFeature(
  withState({
    loading: false,
    idle: false,
    ready: false,
    error: {}
  } as LoadingFeatureState)
);
