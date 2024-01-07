import React from 'react';

/** @output */
export type PageProps<T extends boolean = true> = {
    titleProps?: "TitleBarProps";
    scrollTitleProps?: "TitleBarProps";
    scrollValue?: "Animated.Value";
    underStatusBar?: boolean;
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
    p2?: (name: string) => Promise<any>;
    p3: string;
    p4?: {
        p41: string;
        p42: number[];
        p43: [number, symbol, string]
    }
}

/** @output */
type ExampleA = Omit<{ p1: string; p2: () => void; p3?: symbol; p4: PageProps }, 'p1'>