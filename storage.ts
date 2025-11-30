// Serviços de Storage (Upload de Imagens)
import { supabase } from '../supabase';

export const storageService = {
  /**
   * Upload de avatar
   */
  async uploadAvatar(file: File, userId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return { data: publicUrl, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Upload de imagem de post
   */
  async uploadPostImage(file: File, userId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);

      return { data: publicUrl, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Upload de imagem de serviço
   */
  async uploadServiceImage(file: File, userId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('service-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(data.path);

      return { data: publicUrl, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Upload de imagem de grupo
   */
  async uploadGroupImage(file: File, groupId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${groupId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('group-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(data.path);

      return { data: publicUrl, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Upload de documento (verificação)
   */
  async uploadDocument(file: File, userId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Documentos são privados, retornar path
      return { data: data.path, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Deletar arquivo
   */
  async deleteFile(bucket: string, path: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },
};
