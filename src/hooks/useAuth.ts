import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store';
import { User } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    setUser, 
    setAuthenticated, 
    setLoading, 
    logout 
  } = useUserStore();

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          // 获取用户详细信息
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }

          const userInfo: User = {
            id: userData.id,
            email: userData.email,
            nickname: userData.nickname,
            avatarUrl: userData.avatar_url,
            height: userData.height,
            weight: userData.weight,
            birthDate: userData.birth_date,
            gender: userData.gender,
            runningExperience: userData.running_experience,
            weeklyGoal: userData.weekly_goal,
            monthlyGoal: userData.monthly_goal,
            interestTags: userData.interest_tags || [],
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
          };

          setUser(userInfo);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // 用户登录
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            const userInfo: User = {
              id: userData.id,
              email: userData.email,
              nickname: userData.nickname,
              avatarUrl: userData.avatar_url,
              height: userData.height,
              weight: userData.weight,
              birthDate: userData.birth_date,
              gender: userData.gender,
              runningExperience: userData.running_experience,
              weeklyGoal: userData.weekly_goal,
              monthlyGoal: userData.monthly_goal,
              interestTags: userData.interest_tags || [],
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
            };

            setUser(userInfo);
            setAuthenticated(true);
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          // 用户登出
          setUser(null);
          setAuthenticated(false);
          navigate('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setAuthenticated, setLoading, navigate]);

  // 登录函数
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 注册函数
  const signUp = async (email: string, password: string, nickname: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 如果注册成功，创建用户资料
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            nickname,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      logout();
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户资料
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          nickname: updates.nickname,
          avatar_url: updates.avatarUrl,
          height: updates.height,
          weight: updates.weight,
          birth_date: updates.birthDate,
          gender: updates.gender,
          running_experience: updates.runningExperience,
          weekly_goal: updates.weeklyGoal,
          monthly_goal: updates.monthlyGoal,
          interest_tags: updates.interestTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // 更新本地状态
      setUser({ ...user, ...updates });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};