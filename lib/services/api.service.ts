import { ApiError } from '@/lib/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

const DEFAULT_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
  credentials: 'include',
};

/**
 * Bāzes API klase ar kopīgām metodēm
 */
export class BaseApiService {
  protected baseUrl: string;
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * GET pieprasījums ar kešošanas atbalstu
   */
  protected async get<T = any>(
    endpoint: string, 
    options?: RequestInit,
    cache?: RequestCache
  ): Promise<T> {
    try {
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'GET',
        cache: cache || 'no-store',
      });

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Radās kļūda', 
          response.status,
          undefined,
          data.errors
        );
      }

      return data.success && data.data ? data.data : {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Radās nezināma kļūda';
      throw new ApiError(message);
    }
  }

  /**
   * POST pieprasījums
   */
  protected async post<T = any, D = any>(
    endpoint: string, 
    data?: D, 
    options?: RequestInit
  ): Promise<T> {
    try {
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'Radās kļūda', 
          response.status,
          undefined,
          responseData.errors
        );
      }

      return responseData.success && responseData.data ? responseData.data : {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Radās nezināma kļūda';
      throw new ApiError(message);
    }
  }

  /**
   * PUT pieprasījums
   */
  protected async put<T = any, D = any>(
    endpoint: string, 
    data?: D, 
    options?: RequestInit
  ): Promise<T> {
    try {
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'Radās kļūda', 
          response.status,
          undefined,
          responseData.errors
        );
      }

      return responseData.success && responseData.data ? responseData.data : {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Radās nezināma kļūda';
      throw new ApiError(message);
    }
  }

  /**
   * DELETE pieprasījums
   */
  protected async delete<T = any>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    try {
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'DELETE',
      });

      const responseData = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'Radās kļūda', 
          response.status,
          undefined,
          responseData.errors
        );
      }

      return responseData.success && responseData.data ? responseData.data : {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Radās nezināma kļūda';
      throw new ApiError(message);
    }
  }
}

/**
 * Komponenta servisa klase
 */
export class ComponentService extends BaseApiService {
  constructor() {
    super('/api/admin/components');
  }
  
  /**
   * Iegūt visus komponentus
   */
  async getAllComponents() {
    return this.get<Component[]>('');
  }
  
  /**
   * Iegūt komponenta detaļas pēc ID
   */
  async getComponentById(id: string) {
    return this.get<Component>(`/${id}`);
  }
  
  /**
   * Izveidot jaunu komponenta
   */
  async createComponent(componentData: Partial<Component>) {
    return this.post<Component, Partial<Component>>('', componentData);
  }
  
  /**
   * Atjaunināt komponenta informāciju
   */
  async updateComponent(id: string, componentData: Partial<Component>) {
    return this.put<Component, Partial<Component>>(`/${id}`, componentData);
  }
  
  /**
   * Dzēst komponenta
   */
  async deleteComponent(id: string) {
    return this.delete(`/${id}`);
  }
}

/**
 * Konfigurācijas servisa klase
 */
export class ConfigurationService extends BaseApiService {
  constructor() {
    super('/api/configurations');
  }
  
  /**
   * Iegūt lietotāja konfigurācijas
   */
  async getUserConfigurations() {
    return this.get<Configuration[]>('');
  }
  
  /**
   * Iegūt konfigurāciju pēc ID
   */
  async getConfigurationById(id: string) {
    return this.get<Configuration>(`/${id}`);
  }
  
  /**
   * Izveidot jaunu konfigurāciju
   */
  async createConfiguration(configData: ConfigurationInput) {
    return this.post<Configuration, ConfigurationInput>('', configData);
  }
  
  /**
   * Atjaunināt konfigurāciju
   */
  async updateConfiguration(id: string, configData: Partial<ConfigurationInput>) {
    return this.put<Configuration, Partial<ConfigurationInput>>(`/${id}`, configData);
  }
  
  /**
   * Dzēst konfigurāciju
   */
  async deleteConfiguration(id: string) {
    return this.delete(`/${id}`);
  }
}

/**
 * Gatavu konfigurāciju servisa klase
 */
export class ReadyConfigService extends BaseApiService {
  constructor() {
    super('/api/public-configurations');
  }
  
  /**
   * Iegūt visas publiskās konfigurācijas
   */
  async getPublicConfigurations() {
    return this.get<Configuration[]>('');
  }
}

/**
 * Autentifikācijas servisa klase
 */
export class AuthService extends BaseApiService {
  constructor() {
    super('/api/auth');
  }
  
  /**
   * Pieslēgties
   */
  async login(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    
    const loginData = {
      password,
      ...(isEmail ? { email: identifier } : { phoneNumber: identifier })
    };
    
    return this.post<{ user: User }, typeof loginData>('/login', loginData);
  }
  
  /**
   * Reģistrēties
   */
  async register(userData: {
    name: string;
    surname: string;
    email?: string;
    phoneNumber?: string;
    password: string;
  }) {
    return this.post<{ user: User }, typeof userData>('/register', userData);
  }
  
  /**
   * Atslēgties
   */
  async logout() {
    return this.post('/logout');
  }
  
  /**
   * Pārbaudīt autentifikācijas statusu
   */
  async checkAuth() {
    return this.get<{ authenticated: boolean; userId: string; role: string }>('/check');
  }
}

// Eksportējam visus servisa vienkāršai lietošanai
export const apiServices = {
  components: new ComponentService(),
  configurations: new ConfigurationService(),
  readyConfigs: new ReadyConfigService(),
  auth: new AuthService(),
};

// Definēt biežāk izmantotās saskarnes šeit, lai izvairītos no atkārtota importa
export interface Component {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price: number;
  specifications: string | Record<string, any>;
  availabilityStatus: string;
  productCode?: string;
}

export interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  components: Component[];
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationInput {
  name: string;
  components: string[];
  status?: string;
  isPublic?: boolean;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  profilePicture?: string | null;
}