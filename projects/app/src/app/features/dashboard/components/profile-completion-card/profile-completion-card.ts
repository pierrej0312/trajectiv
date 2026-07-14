import { Component, computed, input, output } from '@angular/core';
import { DashboardProfileCompletionVm } from '@features/dashboard/models/dashboard.model';
import { Skeleton } from 'primeng/skeleton';
import { Card } from 'primeng/card';
import { ButtonDirective } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';
export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};
@Component({
  selector: 'app-profile-completion-card',
  imports: [Card, ButtonDirective, ProgressBar, Skeleton, NgApexchartsModule],
  templateUrl: './profile-completion-card.html',
  styleUrl: './profile-completion-card.css',
})
export class ProfileCompletionCard {
  readonly completion = input.required<DashboardProfileCompletionVm>();

  readonly loading = input(false);
  readonly error = input(false);

  readonly openProfile = output<void>();
  readonly retry = output<void>();

  readonly series = computed<ApexNonAxisChartSeries>(() => {
    const percentage = this.completion().percentage;

    return [Math.min(100, Math.max(0, percentage))];
  });

  readonly chartOptions: ChartOptions = {
    chart: {
      type: 'radialBar',
      width: '100%',
      height: '100%',
      sparkline: {
        enabled: true,
      },
      animations: {
        enabled: true,
        speed: 700,
        animateGradually: {
          enabled: true,
          delay: 120,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 500,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      parentHeightOffset: 0,
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },

    colors: ['var(--p-primary-color)'],

    stroke: {
      lineCap: 'round',
    },

    fill: {
      type: 'solid',
      opacity: 1,
    },

    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        hollow: {
          size: '76%',
          margin: 0,
          background: 'transparent',
        },

        track: {
          background: 'color-mix(in srgb, var(--p-text-muted-color) 18%, transparent)',
          strokeWidth: '100%',

          margin: 0,

          dropShadow: {
            enabled: false,
          },
        },

        dataLabels: {
          show: true,
          name: {
            show: false,
          },

          value: {
            show: true,
            offsetY: 6,
            color: 'var(--p-text-color)',
            fontSize: '1.5rem',
            fontWeight: 700,

            formatter: (value: number): string => {
              return `${Math.round(value)}%`;
            },
          },

          total: {
            show: false,
          },
        },
      },
    },

    dataLabels: {
      enabled: true,
    },

    tooltip: {
      enabled: false,
    },

    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },

      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
        },
      },
    },
  };
}
