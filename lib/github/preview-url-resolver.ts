import { GitHubRunContext } from "./github-types";

export interface ResolvedPreviewUrl {
  url: string;
  source: string;
}

export interface PreviewUrlResolver {
  resolve(context: GitHubRunContext): Promise<ResolvedPreviewUrl | null>;
}

export class DeploymentStatusPreviewResolver implements PreviewUrlResolver {
  async resolve(context: GitHubRunContext): Promise<ResolvedPreviewUrl | null> {
    if (context.previewUrl) {
      return { url: context.previewUrl, source: "deployment_status" };
    }
    return null;
  }
}

export class ManualPreviewResolver implements PreviewUrlResolver {
  async resolve(context: GitHubRunContext): Promise<ResolvedPreviewUrl | null> {
    if (context.previewUrl) {
      return { url: context.previewUrl, source: "manual_dispatch" };
    }
    return null;
  }
}
