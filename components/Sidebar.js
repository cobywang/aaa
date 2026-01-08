import { defineComponent, ref } from 'vue';
import { ChevronDown, ChevronRight, Box, User, Truck, FileText, DollarSign, Activity, ShoppingCart, Archive, Clipboard } from 'lucide-vue-next';

export default defineComponent({
  components: {
    ChevronDown, ChevronRight, Box, User, Truck, FileText, DollarSign, Activity, ShoppingCart, Archive, Clipboard
  },
  props: {
    categories: Array,
    activeAgentId: String
  },
  emits: ['select-agent'],
  setup(props, { emit }) {
    const openCategories = ref(['chan']);

    const toggleCategory = (id) => {
      if (openCategories.value.includes(id)) {
        openCategories.value = openCategories.value.filter(c => c !== id);
      } else {
        openCategories.value.push(id);
      }
    };

    const getCategoryIcon = (id) => {
      switch (id) {
        case 'chan': return 'Box';
        case 'xiao': return 'ShoppingCart';
        case 'ren': return 'User';
        case 'fa': return 'FileText';
        case 'cai': return 'DollarSign';
        default: return 'Box';
      }
    };

    const getAgentIcon = (name) => {
      if (name.includes("訂單")) return 'Clipboard';
      if (name.includes("庫存")) return 'Archive';
      if (name.includes("品質")) return 'Activity';
      if (name.includes("流程")) return 'Truck';
      return 'FileText';
    };

    return {
      openCategories,
      toggleCategory,
      getCategoryIcon,
      getAgentIcon,
      emit
    };
  },
  template: `
    <div class="h-full bg-slate-900 text-slate-100 flex flex-col w-64 flex-shrink-0 shadow-xl border-r border-slate-700">
      <div class="p-6 border-b border-slate-700">
        <h1 class="text-xl font-bold tracking-wider text-orange-500 flex items-center gap-2">
          NEUROSME
        </h1>
      </div>

      <div class="flex-1 overflow-y-auto py-4">
        <div v-for="category in categories" :key="category.id" class="mb-2">
          <button
            @click="toggleCategory(category.id)"
            class="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-800 transition-colors"
            :class="{ 'bg-slate-800': openCategories.includes(category.id) }"
          >
            <div class="flex items-center gap-3 font-medium">
              <component :is="getCategoryIcon(category.id)" :size="20" />
              <span>{{ category.name }}</span>
            </div>
            <component :is="openCategories.includes(category.id) ? 'ChevronDown' : 'ChevronRight'" :size="16" />
          </button>

          <div v-if="openCategories.includes(category.id)" class="bg-slate-950 py-2">
            <button
              v-for="agent in category.agents"
              :key="agent.id"
              @click="emit('select-agent', agent.id)"
              class="w-full flex items-center gap-3 px-8 py-2.5 text-sm transition-all border-l-4"
              :class="activeAgentId === agent.id ? 'border-blue-500 bg-blue-900/30 text-blue-200' : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900'"
            >
              <component :is="getAgentIcon(agent.name)" :size="16" />
              {{ agent.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
});