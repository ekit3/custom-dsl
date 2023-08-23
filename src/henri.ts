export class Henri {
    hungry = false;
    full = false;

    public eat(food: string, amount: number): boolean {
        if (!this.hungry) {
            console.warn("I'm not hungry sorry !");
            return false;
        }

        if (this.full) {
            console.warn("I'm full *pouf* sorry !");
            return false;
        }

        console.log(`I've ate ${amount} delicious ${food} !`);
        if (amount === 3 && food === 'biscuit')  {
            this.full = true;
            console.log("Right now, I'm full - *pouf*");
        }

        return true;
    }
}