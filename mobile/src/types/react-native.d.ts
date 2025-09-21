// Type declarations for react-native-maps
declare module 'react-native-maps' {
  import React from 'react';
  import { ViewStyle } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface LatLng {
    latitude: number;
    longitude: number;
  }

  export interface MapViewProps {
    style?: ViewStyle;
    region?: Region;
    initialRegion?: Region;
    showsUserLocation?: boolean;
    loadingEnabled?: boolean;
    children?: React.ReactNode;
  }

  export interface MarkerProps {
    coordinate: LatLng;
    title?: string;
    description?: string;
  }

  export default class MapView extends React.Component<MapViewProps> {}
  export class Marker extends React.Component<MarkerProps> {}
}