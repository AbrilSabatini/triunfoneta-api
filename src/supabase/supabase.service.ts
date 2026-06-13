import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const key = this.configService.get<string>('SUPABASE_SERVICE_KEY')!;

    if (!url || !key || key === 'poner_acá_la_service_role_key') {
      this.logger.warn(
        'Supabase no configurado — las subidas de archivos fallarán',
      );
    }

    this.supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  async uploadFile(
    bucket: string,
    filePath: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error subiendo a Supabase: ${error.message}`);
      throw error;
    }

    const { data: publicUrl } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      this.logger.error(`Error eliminando de Supabase: ${error.message}`);
    }
  }

  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(
        (p) => p === 'object' || p === 'public',
      );
      if (bucketIndex === -1) return null;
      return pathParts.slice(bucketIndex + 2).join('/');
    } catch {
      return null;
    }
  }
}
