import { Command, flags } from "@oclif/command";
import execa from "execa";
import path from "path";
import express from "express";
import livereload from "livereload";
import fs from "fs";
import cli from "cli-ux";
import chalk from "chalk";

export default class Serve extends Command {
  static description = "serves your website on a local webserver";

  static examples = [
    `$ htmlgoddess serve
`,
  ];

  public subprocess = null;

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" }),
  };

  static args = [{ name: "projectPath" }];

  run() {
    const { args, flags } = this.parse(Serve);

    const projectPath = args.projectPath ? args.projectPath : process.cwd();

    return new Promise((resolve, reject) => {
      cli.action.start(`Starting server from ${projectPath}/docs`);
      const app = express();
      const port = 3000;
      const liveReloadScript = `
        <!-- LIVE RELOAD SCRIPT INJECTION -->
        <script>
        document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
        ':35729/livereload.js?snipver=1"></' + 'script>')
        </script>
        <!-- LIVE RELOAD SCRIPT INJECTION -->
    `;

      /**
       * Injects live reload script into all html GET requests.
       */
      app.get("*(.html|.htm|/)", (req, res, next) => {
        res.format({
          html: function () {
            let filename = path.join(projectPath, "/docs", req.url);
            if (filename.charAt(filename.length - 1) === "/") {
              filename += "index.html";
            }

            if (fs.existsSync(filename)) {
              const content = fs
                .readFileSync(filename, "utf-8")
                .replace("</head>", `${liveReloadScript}</head>`);
              res.send(content);
            }
          },
          default: function () {
            next();
          },
        });
      });

      app.use(express.static("docs"));

      app.listen(port, () => {
        cli.action.stop(chalk.green(`started.`));
        this.log("");
        this.log(
          `Local server listening at: ${chalk.keyword("green")(
            `http://localhost:${port}`
          )}`
        );
        this.log("Opening in your browers...");

        cli.open(`http://localhost:${port}`);

        this.log("");
        const liveReloadServer = livereload.createServer();
        this.log(
          `Live reload server listening at: ${chalk.keyword("purple")(
            `http://localhost:${liveReloadServer.config.port}`
          )}`
        );
        liveReloadServer.watch(projectPath + "/docs");
      });

      resolve(app);
    });
  }
}
