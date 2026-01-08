import { computed, defineComponent, h } from 'vue';

export default defineComponent({
  props: {
    data: {
      type: Array,
      required: true
    },
    size: {
      type: Number,
      default: 200
    }
  },
  setup(props) {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    const processedData = computed(() => {
      const total = props.data.reduce((acc, item) => acc + item.value, 0);
      let cumulativePercent = 0;

      return props.data.map((item, index) => {
        const percent = item.value / total;
        const startPercent = cumulativePercent;
        const endPercent = cumulativePercent + percent;
        cumulativePercent += percent;

        // Calculate SVG path for slice
        const x1 = Math.cos(2 * Math.PI * startPercent - Math.PI / 2);
        const y1 = Math.sin(2 * Math.PI * startPercent - Math.PI / 2);
        const x2 = Math.cos(2 * Math.PI * endPercent - Math.PI / 2);
        const y2 = Math.sin(2 * Math.PI * endPercent - Math.PI / 2);
        
        // Large arc flag
        const largeArc = percent > 0.5 ? 1 : 0;

        // Path command: Move to center, Line to start, Arc to end, Close path
        const path = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;

        // Tooltip text
        const percentageText = Math.round(percent * 100) + '%';
        const fill = item.fill || COLORS[index % COLORS.length];

        return {
          ...item,
          path,
          fill,
          percentageText
        };
      });
    });

    return {
      processedData
    };
  },
  template: `
    <div class="relative flex flex-col items-center">
      <svg :viewBox="'-1.2 -1.2 2.4 2.4'" :width="size" :height="size" class="transform">
        <g v-for="(slice, index) in processedData" :key="index">
           <path :d="slice.path" :fill="slice.fill" stroke="white" stroke-width="0.02" class="hover:opacity-80 transition-opacity cursor-pointer">
             <title>{{ slice.name }}: NT$ {{ slice.value.toLocaleString() }} ({{ slice.percentageText }})</title>
           </path>
        </g>
      </svg>
      <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <div v-for="(item, index) in processedData" :key="index" class="flex items-center text-xs text-slate-600">
           <span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: item.fill }"></span>
           {{ item.name }}
        </div>
      </div>
    </div>
  `
});