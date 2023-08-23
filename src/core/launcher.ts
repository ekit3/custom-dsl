import fs from "fs";
import { AfterAll, BeforeAll } from "./lifecycle";
import path from "path";
import async from "async";
import { Pipeline } from "./pipeline";

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
