import { HttpResponse, INetworkApi } from "../../../types/plugin";

export class MockNetworkApi implements INetworkApi {
  constructor(private override?: Partial<INetworkApi>) {}

  async get(url: string): Promise<HttpResponse> {
    return this.override?.get
      ? this.override.get(url)
      : {
          statusCode: 200,
          contentType: "text/html",
          buffer: Buffer.from("Hello world"),
        };
  }
}
