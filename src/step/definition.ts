import { Henri } from "../henri";
import { After, AfterAll, Before, BeforeAll, Given, Then, When } from "./index";

let henri: Henri;

new BeforeAll(() => {
   console.log("It starts soon !");
});

new Before(() => {
    henri = new Henri();
});

new Before(() => {
    console.log("Henri is actually ready");
});

new Given("Henri is (hungry|full)", (attr: string) => {
    henri[attr] = true;
});

new Given("Henri is not (hungry|full)", (attr: string) => {
    henri[attr] = false;
});

new When("he eats [0-3] biscuit", (amountOfBiscuit: number) => {
    henri.eat("biscuit", +amountOfBiscuit);
});

new Then("he will be (hungry|full)", (attr: string): boolean => {
    return henri[attr];
});

new Then("he will not be (hungry|full)", (attr: string): boolean => {
    return !henri[attr];
});

new After(() => {
    console.log("Feel the happiness !");
});

new After(() => {
    console.log("===============\n");
});

new AfterAll(() => {
    console.log("Hope you've enjoyed the trip");
});


