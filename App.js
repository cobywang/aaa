import { defineComponent, ref, computed } from 'vue';
import Sidebar from './components/Sidebar.js';
import ConfigPanel from './components/ConfigPanel.js';
import ChatInterface from './components/ChatInterface.js';
import { DEFAULT_SYSTEM_PROMPT } from './types.js';

export default defineComponent({
  components: { Sidebar, ConfigPanel, ChatInterface },
  setup() {
    const createAgent = (id, name, description) => ({
      id,
      name,
      description,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      files: [],
      messages: []
    });

    const categories = ref([
      {
        id: 'chan',
        name: '產 (營運/交付)',
        agents: [
          createAgent('agent-order', '訂單 Agent', '協助處理訂單匯總、分析與狀態追蹤的行政助手。'),
          createAgent('agent-workflow', '工作流程 Agent', '優化與監控標準作業程序的智能助手。'),
          createAgent('agent-inventory', '庫存/採購 Agent', '監控庫存水位與建議採購計畫。'),
          createAgent('agent-quality', '品質/異常 Agent', '追蹤產品品質數據與異常回報分析。'),
        ]
      },
      {
        id: 'xiao',
        name: '銷 (行銷/業務)',
        agents: [
          createAgent('agent-sales', '銷售數據 Agent', '分析銷售業績與市場趨勢。'),
          createAgent('agent-crm', '客戶關係 Agent', '管理客戶資料與互動記錄。'),
        ]
      },
      {
        id: 'ren',
        name: '人 (人資/行政)',
        agents: [createAgent('agent-hr', '人資 Agent', '處理人事相關事務。')]
      },
      {
        id: 'fa',
        name: '發 (研發/專案)',
        agents: [createAgent('agent-rd', '研發 Agent', '協助專案管理與技術文件。')]
      },
      {
        id: 'cai',
        name: '財 (財務/稅務)',
        agents: [createAgent('agent-fin', '財務 Agent', '提供財務報表分析與稅務建議。')]
      }
    ]);

    const activeAgentId = ref('agent-order');

    const activeAgent = computed(() => {
      for (const cat of categories.value) {
        const agent = cat.agents.find(a => a.id === activeAgentId.value);
        if (agent) return agent;
      }
      return categories.value[0].agents[0];
    });

    const setActiveAgent = (id) => {
      activeAgentId.value = id;
    };

    const handleUpdateAgent = (updatedAgent) => {
      categories.value = categories.value.map(cat => ({
        ...cat,
        agents: cat.agents.map(a => a.id === updatedAgent.id ? updatedAgent : a)
      }));
    };

    return {
      categories,
      activeAgentId,
      activeAgent,
      setActiveAgent,
      handleUpdateAgent
    };
  },
  template: `
    <div class="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      <!-- 1. Sidebar -->
      <Sidebar 
        :categories="categories" 
        :activeAgentId="activeAgentId" 
        @select-agent="setActiveAgent" 
      />

      <!-- 2. Configuration Panel -->
      <div class="flex-none w-[400px] border-r border-slate-200">
        <ConfigPanel 
          :agent="activeAgent" 
          @update-agent="handleUpdateAgent" 
        />
      </div>

      <!-- 3. Chat Interface -->
      <div class="flex-1 min-w-0">
        <ChatInterface 
          :agent="activeAgent" 
          @update-agent="handleUpdateAgent" 
        />
      </div>
    </div>
  `
});