import 'package:flutter/material.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/section_header.dart';

class AppointmentsScreen extends StatelessWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Appointments',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(GGTokens.space6),
        children: [
          const SectionHeader(
            title: 'Your appointments',
            subtitle: 'Upcoming + past visits will appear here',
          ),
          GGCard(
            child: Text(
              'No appointments yet (placeholder).',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: GGColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

