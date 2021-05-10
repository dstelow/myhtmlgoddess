import { Command, flags } from "@oclif/command";
import execa from "execa";
import * as git from "isomorphic-git";
import fs from "fs";
import cli from "cli-ux";

export default class Save extends Command {
  static description = "saves all changes in your project";

  static examples = [
    `$ htmlgoddess save
`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "projectDir" }];

  async run() {
    const { args, flags } = this.parse(Save);

    const projectDir = args.projectDir ? args.projectDir : process.cwd();

    this.log("Saving work", projectDir);
    await execa("git", ["add", projectDir]).stdout.pipe(process.stdout);
    await cli.wait(200);
    await execa("git", ["commit", "-m", "Saving content edit."]);
  }
}
