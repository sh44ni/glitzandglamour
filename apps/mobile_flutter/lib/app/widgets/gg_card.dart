import 'package:flutter/material.dart';

import '../theme/gg_colors.dart';
import '../theme/gg_tokens.dart';

class GGCard extends StatelessWidget {
  const GGCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(GGTokens.space5),
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final card = DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(GGTokens.radiusMd),
        border: Border.all(color: GGColors.pink.withValues(alpha: 0.16)),
        boxShadow: [
          BoxShadow(
            color: GGColors.pink.withValues(alpha: 0.10),
            blurRadius: 26,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Padding(padding: padding, child: child),
    );

    if (onTap == null) return card;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(GGTokens.radiusMd),
        onTap: onTap,
        child: card,
      ),
    );
  }
}

