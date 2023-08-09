import { Pipeline } from './step';

import './step/definition';

const feature =
`Given Alice is hungry
When she eats 3 cucumber
Then she will be full`;

Pipeline.run(feature);