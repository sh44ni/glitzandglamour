import 'package:flutter/material.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/section_header.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notifications',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(GGTokens.space6),
        children: const [
          SectionHeader(
            title: 'Updates',
            subtitle: 'Reminders and perks will show here (placeholder)',
          ),
          GGCard(
            child: Text(
              'No notifications yet.',
              style: TextStyle(color: GGColors.textMuted, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

