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

export class Pipeline {
    static _stepRegistry: { given: Given[], when: When[], then: Then[] } = {
        given: [],
        when: [],
        then: []
    };

    public static run(feature: string): void {
        const lines = feature.split(/\n/);
        const pipe: Step[] = [];

        for (const line of lines) {
            const stepKeyword = this.inputIntegrity(line);
            const step: Step = this.extractStep(line, stepKeyword);
            const lastRun = pipe[pipe.length - 1];

            if (lastRun?.keywordWeight > step.keywordWeight) {
                throw new Error(`Cannot manage ${step.keyword} after ${lastRun.keyword}`);
            }

            this.manageStepResult(step, line);
            pipe.push(step);
        }
    }

    private static manageStepResult(step: Step, line: string): void {
        try {
            const result = step.run(line);
            if (typeof result === 'boolean') {
                console.assert(result, `\x1b[31m -- ${line} - Failed \x1b[0m`)
                return;
            }
            console.log(`\x1b[32m -- ${line} - OK \x1b[0m`);
        } catch (error: unknown) {
            console.error(`\x1b[31m -- ${line} - Thrown \x1b[0m`);
            throw error;
        }
    }

    private static inputIntegrity(line: string): string {
        const stepKeyword = RegExp(Array.from(Step.keywords).join("|")).exec(line)?.[0].toLowerCase();
        if (!stepKeyword) {
            throw new TypeError(`"${line}" didn't use a known keyword to start`);
        }
        return stepKeyword;
    }

    private static extractStep(line: string, stepKeyword: string): Step {
        return this._stepRegistry[stepKeyword].reduce((ret, step) => {
            if (RegExp(step.templateSentence).exec(line.replaceAll(stepKeyword, "")?.trim())) {
                return step;
            }
            return ret;
        });
    }
}