type LifecycleOptions = { order?: number };
abstract class Lifecycle {
    constructor(callback: () => void, { order }: LifecycleOptions = {}) {
        this.add(callback, order ?? this.lastIndex());
    }

    abstract add(callback: () => void, order: number): number;
    abstract lastIndex(): number;
}

export class Before extends Lifecycle {
    static _registry: (() => void)[] = [];
    static _lastIndex = 0;
    public add(callback: () => void, order: number): number {
        Before._registry[order] ??= callback;
        Before._lastIndex = Before._registry.length;
        return order;
    }

    lastIndex(): number {
        return Before._lastIndex;
    }
}

export class After extends Lifecycle {
    static _registry: (() => void)[] = [];
    static _lastIndex = 0;

    public add(callback: () => void, order: number): number {
        After._registry[order] ??= callback;
        After._lastIndex = After._registry.length;
        return order;
    }

    lastIndex(): number {
        return After._lastIndex;
    }
}

export class BeforeAll extends Lifecycle {
    static _registry: (() => void)[] = [];
    static _lastIndex = 0;
    public add(callback: () => void, order: number): number {
        BeforeAll._registry[order] ??= callback;
        BeforeAll._lastIndex = BeforeAll._registry.length;
        return order;
    }

    lastIndex(): number {
        return BeforeAll._lastIndex;
    }
}

export class AfterAll extends Lifecycle {
    static _registry: (() => void)[] = [];
    static _lastIndex = 0;

    public add(callback: () => void, order: number): number {
        AfterAll._registry[order] ??= callback;
        AfterAll._lastIndex = AfterAll._registry.length;
        return order;
    }

    lastIndex(): number {
        return AfterAll._lastIndex;
    }
}