import { Alice } from "../alice";
import { Given, Then, When } from "./index";

const alice = new Alice();

new Given("Alice is (hungry|full)", (attr: string) => {
    alice[attr] = true;
});

new Given("Alice is not (hungry|full)", (attr: string) => {
    alice[attr] = false;
});

new When("she eats [0-3] cucumber", (amountOfCucumber: number) => {
    alice.eat("cucumber", +amountOfCucumber);
});

new Then("she will be (hungry|full)", (attr: string): boolean => {
    return alice[attr];
});

new Then("she will not be (hungry|full)", (attr: string): boolean => {
    return !alice[attr];
});
