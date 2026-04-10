import 'package:flutter/material.dart';

import '../theme/gg_colors.dart';

class StampTracker extends StatelessWidget {
  const StampTracker({
    super.key,
    required this.stamps,
    this.maxStamps = 10,
  });

  final int stamps;
  final int maxStamps;

  @override
  Widget build(BuildContext context) {
    final clamped = stamps.clamp(0, maxStamps);
    return Wrap(
      spacing: 8,
      runSpacing: 10,
      children: List.generate(maxStamps, (i) {
        final filled = i < clamped;
        return Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: filled
                ? const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [GGColors.pink, GGColors.pinkLight],
                  )
                : null,
            color: filled ? null : Colors.white.withValues(alpha: 0.06),
            border: Border.all(
              color: filled
                  ? GGColors.pink.withValues(alpha: 0.35)
                  : Colors.white.withValues(alpha: 0.10),
            ),
            boxShadow: filled
                ? [
                    BoxShadow(
                      color: GGColors.pink.withValues(alpha: 0.25),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: Icon(
              filled ? Icons.star_rounded : Icons.star_border_rounded,
              size: 18,
              color: filled ? Colors.white : GGColors.textDim,
            ),
          ),
        );
      }),
    );
  }
}

class StampProgressLabel extends StatelessWidget {
  const StampProgressLabel({
    super.key,
    required this.stamps,
    this.maxStamps = 10,
  });

  final int stamps;
  final int maxStamps;

  @override
  Widget build(BuildContext context) {
    final clamped = stamps.clamp(0, maxStamps);
    final left = (maxStamps - clamped).clamp(0, maxStamps);
    return Text(
      '$left visits left until your free nail set',
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: GGColors.textMuted,
            fontWeight: FontWeight.w600,
          ),
    );
  }
}

