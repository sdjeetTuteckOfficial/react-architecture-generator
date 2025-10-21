import axiosInstance from '../../security/axios-instance';

/**
 * API service for chat and thread management
 */
class ChatApiService {
  /**
   * Load all threads for the current user
   */
  async loadThreads(skip = 0, limit = 100) {
    try {
      const response = await axiosInstance.get('/architecture/threads', {
        params: { skip, limit },
      });
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const statusText = error.response?.statusText || 'Network Error';
      console.error('Error loading threads:', status, statusText, error);
      return { success: false, error: 'Failed to load chat history' };
    }
  }

  /**
   * Create a new thread
   */
  async createThread(diagramType) {
    try {
      const response = await axiosInstance.post('/architecture/threads', {
        thread_name: `${
          diagramType === 'architecture' ? 'Architecture' : 'Database'
        } Chat - ${new Date().toLocaleString()}`,
        diagram_type: diagramType,
      });

      const thread = response.data;
      const threadId = thread.thread_id || thread.id;

      return { success: true, data: { thread, threadId } };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const statusText = error.response?.statusText || 'Network Error';
      const errorData = error.response?.data || error.message;

      console.error('Failed to create thread:', status, statusText);
      console.error('Error details:', errorData);
      return { success: false, error: 'Failed to create new chat thread' };
    }
  }

  /**
   * Save conversation to a thread
   */
  async saveConversation(threadId, version, messages, diagramData = null) {
    try {
      const conversationData = {
        thread_id: threadId,
        version,
        diagram_json: diagramData || {},
        messages: messages.map((msg) => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      };

      const response = await axiosInstance.post(
        `/architecture/threads/${threadId}/conversations`,
        conversationData
      );

      const savedConversation = response.data;
      return { success: true, data: savedConversation };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const statusText = error.response?.statusText || 'Network Error';
      const errorData = error.response?.data || error.message;

      console.error('Error saving conversation:', status, statusText);
      console.error('Save error details:', errorData);
      return { success: false, error: 'Failed to save conversation' };
    }
  }

  /**
   * Load conversations for a specific thread
   */
  async loadThread(threadId) {
    try {
      const response = await axiosInstance.get(
        `/architecture/threads/${threadId}/conversations`
      );

      const conversations = response.data;
      return { success: true, data: conversations };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const statusText = error.response?.statusText || 'Network Error';

      console.error('Error loading thread:', status, statusText, error);
      return { success: false, error: 'Failed to load conversation' };
    }
  }

  /**
   * Analyze project description
   */
  async analyzeProject(description) {
    try {
      const response = await axiosInstance.post('/architecture/analyze', {
        description,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const statusText = error.response?.statusText || 'Network Error';
      const errorData = error.response?.data || error.message;

      console.error('Error analyzing project:', status, statusText, errorData);
      return { success: false, error: 'Failed to analyze project' };
    }
  }

  /**
   * Generate diagram based on description and context
   */
  async generateDiagram(
    description,
    context,
    responses,
    type = 'architecture'
  ) {
    try {
      const response = await axiosInstance.post(
        '/architecture/generate-diagram',
        {
          description,
          context: context || {},
          clarification_responses: responses || {},
          diagram_type: type,
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const statusText = error.response?.statusText || 'Network Error';
      const errorData = error.response?.data || error.message;

      console.error('Error generating diagram:', status, statusText, errorData);
      return { success: false, error: 'Failed to generate diagram' };
    }
  }
}

export default new ChatApiService();
