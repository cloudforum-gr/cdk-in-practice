import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";

export interface ImageProcessingFunctionProps extends NodejsFunctionProps {
  entry: string;
}
export class ImageProcessingFunction extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ImageProcessingFunctionProps
  ) {
    super(scope, id, {
      ...props,
      entry: `${path.resolve(__dirname, `../handlers/${props.entry}`)}`,
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        nodeModules: ["sharp"],
        forceDockerBundling: true,
      },
    });
  }
}
