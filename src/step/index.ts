// a step is just a sentence/regex with a bound action
// a Scenario is a pipeline of step that should be organized in a good order. (you are close to the goal, keep going)
export abstract class Step {
    templateSentence: string | RegExp;
    callback: Function;

    constructor(sentence: string | RegExp, callback: Function) {
        this.templateSentence = sentence;
        this.callback = callback;
    }

    public get keyword(): string {
        return this.constructor.name;
    }

    // Given user has [0-3] roles, (amountOfRoles) => {}
    // Given user has 3 roles => (3) => {}
    public run(sentence: string): unknown {
        const args: unknown[] = [];
        const template = this.templateSentence.toString();
        const templates = [...this.extractFullRegexp(template), ...this.extractRangeRegExp(template)];
        for (const reg of templates) {
            args.push(new RegExp(reg).exec(sentence));
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
        const iterator = source?.matchAll(/\(?\(((\()?[^(]*(\))?)+\)/g);
        for (const [scheme] of iterator){
            fullRegExp.push(scheme);
        }
        return fullRegExp;
    }

}

export class Given extends Step {}
export class When extends Step {}
export class Then extends Step {}