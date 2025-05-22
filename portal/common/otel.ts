import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export default class OTEL {
  private static instance: OTEL;
  private sdk: NodeSDK;
  private initialized = false;

  private constructor() {
    const endpoint = `http://${process.env.NODE_ENV === 'development' ? 'localhost' : 'otel-collector'}:6317`;
    this.sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'scriptoria',
        [ATTR_SERVICE_VERSION]: '1.0'
      }),
      traceExporter: new OTLPTraceExporter({ url: endpoint }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: endpoint })
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false
          }
        })
      ]
    });
  }

  public static getInstance(): OTEL {
    if (!OTEL.instance) {
      OTEL.instance = new OTEL();
    }
    return OTEL.instance;
  }

  public start() {
    if (!this.initialized) {
      this.initialized = true;
      this.sdk.start();
    }
  }
}
