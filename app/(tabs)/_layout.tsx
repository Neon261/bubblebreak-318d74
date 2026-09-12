import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CalendarCheck, Compass, Inbox, UserRound } from 'lucide-react-native';
import { useUniwind } from 'uniwind';

import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';
import { ME } from '@/lib/types';

export default function TabLayout() {
  const { theme } = useUniwind();

  const unanswered = useAppStore((state) =>
    state.pingIds.reduce((count, id) => {
      const ping = state.pings[id];
      return ping && ping.hostId !== ME && ping.myResponse === 'none' && ping.status === 'open'
        ? count + 1
        : count;
    }, 0),
  );

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: BRAND.paper },
          headerStyle: { backgroundColor: BRAND.paper },
          headerTintColor: BRAND.ink,
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: BRAND.paper,
            borderTopColor: BRAND.border,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarActiveTintColor: BRAND.accent,
          tabBarInactiveTintColor: BRAND.muted,
          tabBarBadgeStyle: { backgroundColor: BRAND.accent, color: '#ffffff' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ping',
            tabBarIcon: ({ color, size }) => <Compass color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="invites"
          options={{
            title: 'Invites',
            tabBarBadge: unanswered > 0 ? unanswered : undefined,
            tabBarIcon: ({ color, size }) => <Inbox color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'Plans',
            tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'You',
            tabBarIcon: ({ color, size }) => <UserRound color={color} size={size ?? 24} />,
          }}
        />
      </Tabs>
    </>
  );
}
