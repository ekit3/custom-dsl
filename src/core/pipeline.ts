import { Given, Step, Then, When } from "./step";
import { After, Before } from "./lifecycle";

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
