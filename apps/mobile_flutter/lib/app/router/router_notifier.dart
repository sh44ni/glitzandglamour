import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/domain/auth_state.dart';
import '../../features/auth/presentation/auth_controller.dart';

class RouterNotifier extends ChangeNotifier {
  RouterNotifier(this.ref) {
    _sub = ref.listen<AuthState>(
      authControllerProvider,
      (previous, next) => notifyListeners(),
    );
  }

  final Ref ref;
  late final ProviderSubscription<AuthState> _sub;

  AuthState get authState => ref.read(authControllerProvider);

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}

