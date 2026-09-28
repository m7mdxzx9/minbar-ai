/**
 * Minbar Mobile: On-Device Quantized SLM Inference Manager
 * Integrates with react-native-llama / llama.cpp / MLC-LLM for local 4-bit GGUF models.
 * (e.g., Qwen-2.5-1.5B-Instruct or Gemma-2-2B-Q4_K_M).
 * Falls back transparently to the Deterministic Template Synthesizer if hardware acceleration is unavailable.
 */

export interface SLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopTokens?: string[];
}

export class LocalSLMInference {
  private static isModelLoaded = false;
  private static llamaContext: any = null;

  /**
   * Initializes local GGUF model via react-native-llama if present on device storage.
   */
  public static async initModel(modelPath: string): Promise<boolean> {
    try {
      // Dynamic import of react-native-llama native module
      const { initLlama } = await import('react-native-llama');
      this.llamaContext = await initLlama({
        model: modelPath,
        use_mlock: true,
        n_ctx: 2048,
        n_threads: 4,
        n_gpu_layers: 0, // Fallback to CPU NEON / Accelerate
      });
      this.isModelLoaded = true;
      return true;
    } catch (err) {
      console.warn('On-Device SLM (react-native-llama) not detected. Using Deterministic Synthesizer:', err);
      this.isModelLoaded = false;
      return false;
    }
  }

  /**
   * Runs local inference on-device with theological guardrails in the system prompt.
   */
  public static async generate(
    systemPrompt: string,
    userPrompt: string,
    options: SLMGenerationOptions = {}
  ): Promise<string | null> {
    if (!this.isModelLoaded || !this.llamaContext) {
      return null; // Signals to use Deterministic Rule-Based Synthesizer
    }

    try {
      const fullPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userPrompt}<|im_end|>\n<|im_start|>assistant\n`;
      const result = await this.llamaContext.completion({
        prompt: fullPrompt,
        n_predict: options.maxTokens || 600,
        temperature: options.temperature || 0.4,
        top_p: options.topP || 0.9,
        stop: options.stopTokens || ['<|im_end|>', '</s>'],
      });
      return result.text;
    } catch (err) {
      console.error('Local SLM generation failed, falling back:', err);
      return null;
    }
  }

  public static isAvailable(): boolean {
    return this.isModelLoaded;
  }
}
