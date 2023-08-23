import async from "async";
import * as fs from "fs";
import * as path from "path";

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

type StepRegistry = { given: Given[], when: When[], then: Then[] };
export class Pipeline {
    static _stepRegistry: StepRegistry = { given: [], when: [], then: [] };
    static keyword = "Title";

    public static run(useCase: string): boolean {
        const lines: string[] = useCase.split(/\n/);
        const pipe: Step[] = [];
        const succeeds: boolean[] = [];
        Before._registry.forEach((callback) => callback());
        for (const raw of lines) {
            const line = raw.replace(/\r/,'');

            if (line.startsWith(this.keyword)) {
               console.log(`\x1b[32m --| ${line} \x1b[0m`);
               continue;
            }

            const stepKeyword = this.inputIntegrity(line);
            const step: Step = this.extractStep(line, stepKeyword);
            const lastRun = pipe[pipe.length - 1];

            if (lastRun?.keywordWeight > step.keywordWeight) {
                throw new Error(`Cannot manage ${step.keyword} after ${lastRun.keyword}`);
            }

            succeeds.push(this.manageStepResult(step, line));
            pipe.push(step);
        }

        After._registry.forEach((callback) => callback());
        return succeeds.every((succeed) => succeed);
    }

    private static manageStepResult(step: Step, line: string): boolean {
        try {
            const result = step.run(line);
            if (typeof result === 'boolean') {
                console.assert(result, `\x1b[31m -- ${line} - Failed \x1b[0m`)
                return result;
            }
            console.log(`\x1b[32m -- ${line} - OK \x1b[0m`);
            return true;
        } catch (error: unknown) {
            console.error(`\x1b[31m -- ${line} - Thrown \x1b[0m`);
            throw error;
        }
    }

    private static inputIntegrity(line: string): string {
        const stepKeyword = RegExp(Array.from(Step.keywords).join("|")).exec(line)?.[0].toLowerCase();
        if (!stepKeyword) {
            throw new TypeError(`This line "${line}" starts with an unknown keyword`);
        }

        return stepKeyword;
    }

    private static extractStep(line: string, stepKeyword: string): Step {
        return this._stepRegistry[stepKeyword].reduce((ret: Step, step: Step): Step => {
            if (RegExp(step.templateSentence).exec(line.replaceAll(stepKeyword, "")?.trim())) {
                return step;
            }
            return ret;
        });
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

export class Launcher {
    static EXT = ".feat";

    public static async run(featureDir: string): Promise<void> {
        const stats: fs.Stats = fs.statSync(featureDir)

        if (!stats.isDirectory()) {
            throw new Error(`The provided path to feature is not a directory ${featureDir}`);
        }

        const files: string[] = fs.readdirSync(featureDir);

        BeforeAll._registry.forEach((callback) => callback());
        await Promise.all(files.map((file) => this.runFile(featureDir, file)));
        AfterAll._registry.forEach((callback) => callback());
    }

    private static async runFile(featureDir: string, file: string): Promise<void>{
        if (path.extname(file) !== this.EXT) {
            return;
        }

        const filepath = path.join(featureDir, file);
        const content = fs.readFileSync(filepath)?.toString();
        const pipelines = this.formatPipelines(content);

        await async.parallel(pipelines);
    }

    private static formatPipelines(content: string): (() => void)[] {
        return content.split(Pipeline.keyword)
            .reduce((useCases: (() => void)[], line: string) => {
                const trimmedLine: string = line.trim();
                if (trimmedLine !== '' && !/\/w+\//.exec(trimmedLine)) { // skip each blank items
                    useCases.push(() => Pipeline.run(`${Pipeline.keyword}${trimmedLine}`));
                }
                return useCases;
            }, []);
    }
}