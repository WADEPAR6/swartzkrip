/**
 * Store de usuarios
 * Maneja el estado global de usuarios usando patrón Singleton
 */

import { IUser, IUserFilters } from '../data/interface/IUser';

interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
  filters: IUserFilters;
  searchQuery: string;
}

class UserStore {
  private static instance: UserStore;
  private state: UserState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.getInitialState();
  }

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  private getInitialState(): UserState {
    return {
      users: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      total: 0,
      hasMore: false,
      filters: {},
      searchQuery: '',
    };
  }

  /**
   * Suscribirse a cambios del estado
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notificar a los listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Obtener el estado actual
   */
  public getState(): UserState {
    return { ...this.state };
  }

  /**
   * Actualizar el estado
   */
  private setState(partial: Partial<UserState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  // ============ ACCIONES ============

  public setUsers(users: IUser[]): void {
    this.setState({ users });
  }

  public setSelectedUser(selectedUser: IUser | null): void {
    this.setState({ selectedUser });
  }

  public setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  public setError(error: string | null): void {
    this.setState({ error });
  }

  public setPagination(
    currentPage: number,
    totalPages: number,
    total: number,
    hasMore: boolean
  ): void {
    this.setState({ currentPage, totalPages, total, hasMore });
  }

  public setFilters(filters: IUserFilters): void {
    this.setState({ filters, currentPage: 1 });
  }

  public setSearchQuery(searchQuery: string): void {
    this.setState({ searchQuery, currentPage: 1 });
  }

  public addUser(user: IUser): void {
    this.setState({
      users: [user, ...this.state.users],
      total: this.state.total + 1,
    });
  }

  public updateUser(user: IUser): void {
    this.setState({
      users: this.state.users.map((u) => (u.id === user.id ? user : u)),
      selectedUser:
        this.state.selectedUser?.id === user.id ? user : this.state.selectedUser,
    });
  }

  public removeUser(userId: string): void {
    this.setState({
      users: this.state.users.filter((u) => u.id !== userId),
      selectedUser:
        this.state.selectedUser?.id === userId ? null : this.state.selectedUser,
      total: this.state.total - 1,
    });
  }

  public reset(): void {
    this.setState(this.getInitialState());
  }
}

export const userStore = UserStore.getInstance();
export default userStore;
