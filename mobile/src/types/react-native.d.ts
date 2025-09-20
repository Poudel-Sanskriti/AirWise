declare module 'react-native' {
    import * as React from 'react';

    export const View: React.ComponentType<any>;
    export const Text: React.ComponentType<any>;
    export const StyleSheet: {
        create<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(styles: T): T;
        hairlineWidth: number;
        absoluteFill: number;
        flatten<T>(style?: StyleSheet.StyleProp<T>): T;
    };
    export namespace StyleSheet {
        type NamedStyles<T> = { [P in keyof T]: any };
        type StyleProp<T> = T | Array<StyleProp<T>>;
    }
}
