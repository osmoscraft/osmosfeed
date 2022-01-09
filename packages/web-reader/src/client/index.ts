import "./index.css";

import { ChannelElement } from "../components/channel.component";
import { ReadingPaneElement } from "../components/reading-pane.component";

customElements.define("osmos-channel", ChannelElement);
customElements.define("osmos-reading-pane", ReadingPaneElement);
