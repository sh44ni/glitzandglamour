import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/appointments/presentation/appointments_screen.dart';
import '../../features/auth/domain/auth_state.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/booking/presentation/booking_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/review_reward/presentation/review_reward_screen.dart';
import '../../features/rewards/presentation/rewards_screen.dart';
import '../../features/wallet/presentation/wallet_pass_screen.dart';
import '../shell/app_shell.dart';
import 'router_notifier.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final routerNotifier = RouterNotifier(ref);

  return GoRouter(
    initialLocation: const SplashRoute().location,
    refreshListenable: routerNotifier,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final loggingIn = state.matchedLocation == const LoginRoute().location ||
          state.matchedLocation == const SignupRoute().location ||
          state.matchedLocation == const SplashRoute().location;

      if (auth.status == AuthStatus.unknown) {
        return const SplashRoute().location;
      }

      final isAuthed = auth.status == AuthStatus.authenticated;
      if (!isAuthed) {
        return loggingIn ? null : const LoginRoute().location;
      }

      if (isAuthed && loggingIn) {
        return const HomeRoute().location;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: const SplashRoute().path,
        name: const SplashRoute().name,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: const LoginRoute().path,
        name: const LoginRoute().name,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: const SignupRoute().path,
        name: const SignupRoute().name,
        builder: (context, state) => const SignupScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: const HomeRoute().path,
                name: const HomeRoute().name,
                builder: (context, state) => const HomeScreen(),
                routes: [
                  GoRoute(
                    path: const NotificationsRoute().subPath,
                    name: const NotificationsRoute().name,
                    builder: (context, state) => const NotificationsScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: const BookRoute().path,
                name: const BookRoute().name,
                builder: (context, state) => const BookingScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: const RewardsRoute().path,
                name: const RewardsRoute().name,
                builder: (context, state) => const RewardsScreen(),
                routes: [
                  GoRoute(
                    path: const ReviewRewardRoute().subPath,
                    name: const ReviewRewardRoute().name,
                    builder: (context, state) => const ReviewRewardScreen(),
                  ),
                  GoRoute(
                    path: const WalletPassRoute().subPath,
                    name: const WalletPassRoute().name,
                    builder: (context, state) => const WalletPassScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: const AppointmentsRoute().path,
                name: const AppointmentsRoute().name,
                builder: (context, state) => const AppointmentsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: const ProfileRoute().path,
                name: const ProfileRoute().name,
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

class SplashRoute {
  const SplashRoute();
  String get name => 'splash';
  String get path => '/';
  String get location => '/';
}

class LoginRoute {
  const LoginRoute();
  String get name => 'login';
  String get path => '/login';
  String get location => '/login';
}

class SignupRoute {
  const SignupRoute();
  String get name => 'signup';
  String get path => '/signup';
  String get location => '/signup';
}

class HomeRoute {
  const HomeRoute();
  String get name => 'home';
  String get path => '/home';
  String get location => '/home';
}

class BookRoute {
  const BookRoute();
  String get name => 'book';
  String get path => '/book';
  String get location => '/book';
}

class RewardsRoute {
  const RewardsRoute();
  String get name => 'rewards';
  String get path => '/rewards';
  String get location => '/rewards';
}

class AppointmentsRoute {
  const AppointmentsRoute();
  String get name => 'appointments';
  String get path => '/appointments';
  String get location => '/appointments';
}

class ProfileRoute {
  const ProfileRoute();
  String get name => 'profile';
  String get path => '/profile';
  String get location => '/profile';
}

class NotificationsRoute {
  const NotificationsRoute();
  String get name => 'notifications';
  String get subPath => 'notifications';
}

class ReviewRewardRoute {
  const ReviewRewardRoute();
  String get name => 'review_reward';
  String get subPath => 'review-reward';
}

class WalletPassRoute {
  const WalletPassRoute();
  String get name => 'wallet_pass';
  String get subPath => 'wallet-pass';
}

