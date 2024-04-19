const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ["query"] });

const app = new Hono();

function scheduleTable(schedules) {
  return html`
    <table>
      <tr>
        <th>予定名</th>
        <th>更新日時</th>
      </tr>
      ${schedules.map(
        (schedule) => html`
          <tr>
            <td>
              <a href="/schedules/${schedule.scheduleId}">
                ${schedule.scheduleName}
              </a>
            </td>
            <td>${schedule.updatedAt}</td>
          </tr>
        `,
      )}
    </table>
  `;
}

app.get("/", async (c) => {
  const { user } = c.get("session") ?? {};
  const schedules = user
    ? await prisma.schedule.findMany({
        where: { createdBy: user.id },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return c.html(
    layout(
      c,
      null,
      html`
        <div class="my-3">
          <div class="p-5 bg-light rounded-3">
            <h1 class="text-body">予定調整くん</h1>
            <p class="lead">
              予定調整くんは、GitHubで認証でき、予定を作って出欠が取れるサービスです。
            </p>
          </div>
        </div>
        ${user
          ? html`
              <div>
                <a href="/logout">${user.login} をログアウト</a>
              </div>
              <div>
                <a href="/schedules/new">予定を作る</a>
              </div>
              ${schedules.length > 0
                ? html`
                    <h3>あなたの作った予定一覧</h3>
                    ${scheduleTable(schedules)}
                  `
                : ""}
            `
          : html`
              <div>
                <a href="/login">ログイン</a>
              </div>
            `}
      `,
    ),
  );
});

module.exports = app;
