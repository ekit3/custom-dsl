import { Alice } from './alice';
import { pipelineByKeyword } from './step/pipeline';
import { Given, Then, When } from './step';

const alice = new Alice();

const given = [
    new Given("Alice is hungry", () => {
        alice.hungry = true;
    })
];

const when = [
    new When(/^she eats [0-3] cucumber$/, (amountOfCucumber: number) => {
        alice.eat("cucumber", +amountOfCucumber);
    })
];

const then = [
    new Then("she will be full", (): boolean => {
        if (!alice.full) {
            throw new Error("Alice is not full !");
        }
        return true;
    })
];

const feature =
`Given Alice is hungry
When she eats 3 cucumber
Then she will be full`;

pipelineByKeyword(feature, { given, when, then });
