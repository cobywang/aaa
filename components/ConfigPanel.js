import { defineComponent, ref } from 'vue';
import { FileSpreadsheet, Trash2, Upload, Info, Settings, Save } from 'lucide-vue-next';

export default defineComponent({
  components: { FileSpreadsheet, Trash2, Upload, Info, Settings, Save },
  props: {
    agent: Object
  },
  emits: ['update-agent'],
  setup(props, { emit }) {
    const fileInputRef = ref(null);

    const handleFileUpload = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const newFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
        };
        emit('update-agent', {
          ...props.agent,
          files: [...props.agent.files, newFile]
        });
      }
    };

    const removeFile = (fileId) => {
      emit('update-agent', {
        ...props.agent,
        files: props.agent.files.filter(f => f.id !== fileId)
      });
    };

    const updatePrompt = (e) => {
      emit('update-agent', {
        ...props.agent,
        systemPrompt: e.target.value
      });
    };

    const triggerFileInput = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click();
      }
    };

    return {
      fileInputRef,
      handleFileUpload,
      removeFile,
      updatePrompt,
      triggerFileInput
    };
  },
  template: `
    <div class="h-full flex flex-col bg-slate-50 border-r border-slate-200 shadow-inner">
      <div class="p-6 border-b border-slate-200 bg-white">
        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          {{ agent.name }} <Info :size="16" class="text-slate-400" />
        </h2>
        <p class="text-sm text-slate-500 mt-1">{{ agent.description }}</p>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        
        <!-- Knowledge Base Section -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-slate-700 flex items-center gap-2">
              知識庫上傳文件 <span class="text-xs font-normal bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{{ agent.files.length }}</span>
            </h3>
          </div>
          
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div v-if="agent.files.length > 0" class="divide-y divide-slate-100">
              <div v-for="file in agent.files" :key="file.id" class="p-3 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="bg-green-100 text-green-600 p-2 rounded-lg">
                    <FileSpreadsheet :size="18" />
                  </div>
                  <span class="text-sm font-medium text-slate-700 truncate max-w-[180px]" :title="file.name">
                    {{ file.name }}
                  </span>
                </div>
                <button 
                  @click="removeFile(file.id)"
                  class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
            <div v-else class="p-8 text-center text-slate-400 text-sm">
              No files uploaded yet.
            </div>
          </div>

          <div class="mt-3 text-center">
             <input 
                type="file" 
                ref="fileInputRef" 
                class="hidden" 
                @change="handleFileUpload"
                accept=".csv,.xlsx,.xls,.pdf,.txt"
             />
             <button 
                @click="triggerFileInput"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 w-full py-2 hover:bg-blue-50 rounded-lg transition-colors dashed border border-transparent hover:border-blue-200"
             >
               <Upload :size="16" /> Add source
             </button>
          </div>
        </section>

        <!-- Core Prompt Section -->
        <section class="flex flex-col flex-1 min-h-[300px]">
           <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-slate-700 flex items-center gap-2">
              核心 Prompt <Settings :size="16" class="text-slate-400"/>
            </h3>
            <div class="flex gap-2 text-xs">
                <span class="flex items-center gap-1 cursor-pointer text-slate-900 font-medium">
                    <input type="checkbox" checked readonly class="rounded text-blue-600" /> 使用預設
                </span>
                <span class="flex items-center gap-1 cursor-pointer text-slate-400">
                     自訂
                </span>
            </div>
          </div>

          <div class="relative flex-1">
            <textarea
              :value="agent.systemPrompt"
              @input="updatePrompt"
              class="w-full h-full min-h-[300px] p-4 text-sm leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Define how the agent should behave..."
            ></textarea>
            <div class="absolute bottom-3 right-3">
                 <button class="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-colors shadow-sm" title="Save Prompt">
                    <Save :size="16" />
                 </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
});