import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructLayoutEngine,
  constructRoutes,
} from "single-spa-layout";

import "./root.styles.scss";
import { isAuthorised } from "@mtfh/common/lib/auth";
import { getConfiguration } from "@mtfh/common/lib/configuration";

getConfiguration();
const templatePath = isAuthorised() ? "authorised" : "public";
const header = document.querySelector(`#single-spa-layout-header`) as HTMLTemplateElement;
const footer = document.querySelector(`#single-spa-layout-footer`) as HTMLTemplateElement;
const main = document.querySelector(
  `#single-spa-layout-${templatePath}`,
) as HTMLTemplateElement;

const template = `
  <single-spa-router>
    ${header.innerHTML}
    ${main.innerHTML}
    ${footer.innerHTML}
  </single-spa-router>
`;

const routes = constructRoutes(template, {
  loaders: {
    header: `
      <div class="lbh-header">
          <div class="lbh-header__main">
              <div class="lbh-header__title-link lbh-header__logo"></div>
          </div>
      </fiv>`,
    spinner: `
      <div class="mtfh-spinner">
        <svg viewBox="0 0 42 42" stroke="#00703c" width="50" height="50" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(3 3)" stroke-width="5">
              <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(112.708 18 18)" />
            </g>
          </g>
        </svg>
      </div>
    `,
  },
  props: {
    serviceName: "LBH Finance",
    betaBannerCopy: "LBH Finance home is under development.",
    reportIssueLink: "https://forms.gle/5kUGcRYFwwaZWrGs8",
    suggestFeatureLink: "https://forms.gle/yM7zCKYZcuVzSXkC6",
  },
});

const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  },
});

const layoutEngine = constructLayoutEngine({ routes, applications });

for (const application of applications) {
  registerApplication(application);
}

layoutEngine.activate();

start();
