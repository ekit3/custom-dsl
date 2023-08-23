import { Pipeline } from "./pipeline";

export abstract class Step {
    public static keywords: Set<string> = new Set();
    templateSentence: string | RegExp;
    callback: Function;

    constructor(sentence: string | RegExp, callback: Function) {
        this.templateSentence = sentence;
        this.callback = callback;
        Step.keywords.add(this.keyword);
        Pipeline._stepRegistry[this.keyword?.toLowerCase()].push(this);
    }

    public get keyword(): string {
        return this.constructor.name;
    }

    public abstract get keywordWeight(): number;

    public run(sentence: string): unknown {
        const args: unknown[] = [];
        const template = this.templateSentence.toString();
        const templates = [...this.extractFullRegexp(template), ...this.extractRangeRegExp(template)];
        for (const reg of templates) {
            args.push(new RegExp(reg).exec(sentence)?.[0]);
        }
        return this.callback(...args);
    }

    public extractRangeRegExp(source: string): string[] {
        const rangeRegExp: string[] = [];
        const iterator = source?.matchAll(/\[[^[]*]/g);
        for (const [scheme] of iterator){
            rangeRegExp.push(scheme);
        }
        return rangeRegExp;
    }

    public extractFullRegexp(source: string): string[] {
        const fullRegExp: string[] = [];
        const iterator = source?.matchAll(/\(?\(((\()?[^(]+(\))?)+\)/g);
        for (const [scheme] of iterator){
            fullRegExp.push(scheme);
        }
        return fullRegExp;
    }

}

export class Given extends Step {
    get keywordWeight(): number {
        return 0;
    }
}
export class When extends Step {
    get keywordWeight(): number {
        return 1;
    }
}
export class Then extends Step {
    get keywordWeight(): number {
        return 2;
    }
}