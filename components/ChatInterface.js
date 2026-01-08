import { defineComponent, ref, watch, nextTick } from 'vue';
import { Send, RefreshCw, Maximize2, Download, Bot, User, FileSpreadsheet } from 'lucide-vue-next';
import { sendMessageToGemini } from '../services/geminiService.js';
import SimplePieChart from './SimplePieChart.js';

export default defineComponent({
  components: { Send, RefreshCw, Maximize2, Download, Bot, User, FileSpreadsheet, SimplePieChart },
  props: {
    agent: Object
  },
  emits: ['update-agent'],
  setup(props, { emit }) {
    const input = ref('');
    const isLoading = ref(false);
    const messagesEndRef = ref(null);

    const scrollToBottom = async () => {
      await nextTick();
      if (messagesEndRef.value) {
        messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
      }
    };

    watch(() => props.agent.messages, scrollToBottom, { deep: true });
    
    // Initial scroll
    watch(() => props.agent.id, scrollToBottom);

    const handleSend = async () => {
      if (!input.value.trim() || isLoading.value) return;

      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input.value,
        timestamp: Date.now(),
      };

      // Optimistically add user message
      const newHistory = [...props.agent.messages, userMessage];
      emit('update-agent', { ...props.agent, messages: newHistory });
      
      const currentPrompt = props.agent.systemPrompt;
      const currentFiles = props.agent.files; // Get current files
      const userText = input.value;
      input.value = '';
      isLoading.value = true;
      
      await scrollToBottom();

      // Call Gemini with files
      const response = await sendMessageToGemini(
        newHistory,
        userText,
        currentPrompt,
        currentFiles
      );

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        chartData: response.chartData
      };

      emit('update-agent', { ...props.agent, messages: [...newHistory, botMessage] });
      isLoading.value = false;
      await scrollToBottom();
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return {
      input,
      isLoading,
      messagesEndRef,
      handleSend,
      handleKeyPress
    };
  },
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Header -->
      <div class="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
        <div class="flex items-center gap-3">
           <div class="bg-slate-100 p-2 rounded-full">
               <Bot :size="20" class="text-slate-700" />
           </div>
           <div>
             <h2 class="font-bold text-slate-800">{{ agent.name }}</h2>
             <p class="text-xs text-slate-500 flex items-center gap-1">
               <span v-if="isLoading" class="text-blue-500 animate-pulse flex items-center gap-1">NeuroSME ai ... 思考中 <RefreshCw :size="10" class="animate-spin"/></span>
               <span v-else>Ready</span>
             </p>
           </div>
        </div>
        <div class="flex items-center gap-2 text-slate-400">
           <button class="hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <RefreshCw :size="18" />
           </button>
           <button class="hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <Maximize2 :size="18" />
           </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] scrollbar-hide space-y-6">
        <div v-if="agent.messages.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
             <Bot :size="48" class="mb-4 text-slate-300" />
             <p>Select an agent and start the conversation.</p>
        </div>

        <div
          v-for="msg in agent.messages"
          :key="msg.id"
          class="flex w-full"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
            <div class="flex max-w-[85%] gap-3 items-start" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
               <!-- Avatar -->
               <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1" :class="msg.role === 'user' ? 'bg-slate-200' : 'bg-transparent'">
                  <User v-if="msg.role === 'user'" :size="16" class="text-slate-500" />
                  <div v-else class="relative">
                    <img src="https://picsum.photos/64/64" alt="Bot" class="w-8 h-8 rounded-full object-cover shadow-sm border border-white" />
                    <div class="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                  </div>
               </div>

               <!-- Bubble -->
               <div class="flex flex-col" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
                  <div
                    class="px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap"
                    :class="msg.role === 'user' ? 'bg-white text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'"
                  >
                    {{ msg.text }}
                  </div>
                  
                  <!-- Chart Rendering -->
                  <div v-if="msg.chartData && msg.chartData.type === 'pie'" class="mt-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 w-full min-w-[300px]">
                     <h4 class="text-sm font-semibold text-slate-700 mb-2 text-center">{{ msg.chartData.title }}</h4>
                     <SimplePieChart :data="msg.chartData.data" />
                  </div>

                  <!-- Simulated File Download -->
                  <div v-if="msg.role === 'model' && msg.text.includes('template_for_order_agent.xlsx')" class="mt-2 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
                     <div class="bg-green-100 p-1.5 rounded text-green-600">
                        <FileSpreadsheet :size="16" />
                     </div>
                     <span class="text-xs font-medium text-slate-600 group-hover:text-blue-700 underline decoration-slate-300 group-hover:decoration-blue-400">template_for_order_agent.xlsx</span>
                     <Download :size="14" class="text-slate-400 group-hover:text-blue-500 ml-auto" />
                  </div>
               </div>
            </div>
        </div>
        <div ref="messagesEndRef"></div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-[#f0f2f5]">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center p-2 pr-3 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            v-model="input"
            @keydown="handleKeyPress"
            placeholder="詢問 Agent..."
            class="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-slate-700 placeholder-slate-400 text-sm outline-none"
            :disabled="isLoading"
          />
          <button
            @click="handleSend"
            :disabled="isLoading || !input.trim()"
            class="p-2.5 rounded-xl transition-all flex items-center justify-center"
            :class="(input.trim() && !isLoading) ? 'bg-slate-800 text-white shadow-md hover:bg-slate-700 transform hover:scale-105' : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
          >
             <RefreshCw v-if="isLoading" :size="18" class="animate-spin" />
             <Send v-else :size="18" />
          </button>
        </div>
        <div class="text-center mt-2">
             <p class="text-[10px] text-slate-400">AI can make mistakes. Please verify important information.</p>
        </div>
      </div>
    </div>
  `
});