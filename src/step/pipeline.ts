import { Given, Step, Then, When } from './index';

export function pipeline(feature: string, steps: Step[]) {
    const lines = feature
        .replaceAll("Given", "")
        .replaceAll("When", "")
        .replaceAll("Then", "")
        .split(/\n/);
    for (const line of lines) {
       const step: Step = steps.reduce((ret, step) => {
           if (RegExp(step.templateSentence).exec(line?.trim())) {
               return step;
           }
           return ret;
       });

       step.run(line);
    }
}

export function pipelineByKeyword(feature: string, steps: { given: Given[], when: When[], then: Then[] }) {
    const lines = feature.split(/\n/);
    for (const line of lines) {
        const stepKeyword = line.match(/Given|When|Then/g)?.[0].toLowerCase();
        if (!stepKeyword) {
            throw new TypeError(`${line} didn't use a known keyword to start`);
        }
        const step: Step = steps[stepKeyword].reduce((ret, step) => {
            if (RegExp(step.templateSentence).exec(line.replaceAll(stepKeyword, "")?.trim())) {
                return step;
            }
            return ret;
        });
        step.run(line);
    }
}