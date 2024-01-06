import React from 'react';

/** @output */
export type PageProps<T extends boolean = true> = {
    titleProps?: "TitleBarProps";
    scrollTitleProps?: "TitleBarProps";
    scrollValue?: "Animated.Value";
    underStatusBar?: boolean;
    supportVersion?: string;
    updateMessage?: string;
    titleBarFixed?: boolean;
    autoTn?: boolean;
    needUpdateStatusBarOnShow?: boolean;
    theme?: "CustomThemeType";
    renderUpdate?: () => React.ReactNode;
    style?: "StyleProp<ViewStyle>";
    statusBarBgColor?: string;
    statusBarStyle?: "StatusBarStyle";
    bounces?: boolean;
    backgroundImage?: string;
    imageProps?: "BackgroundImageProps['imageProps']";
    WrapperComponent?: React.FC<any> | React.ComponentClass<any>;
    getData?: () => Promise<T>;
    // children(paddingTop: number): React.ReactNode;
    children(
        data: T,
        paddingTop: number,
        retry: () => Promise<void>,
        refresh: () => Promise<void>,
    ): React.ReactNode;
} & Omit<ABC, 'p1' | 'p3'>


export interface ABC {
    p1: string;
    p2?: number;
    p3: string;
}

/** @output */
type ExampleA = Omit<{ p1: string; p2: () => void; p3?: symbol; p4: number }, 'p4'>