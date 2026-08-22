import 'package:flutter/material.dart';

/// Primary & Neutral Design Tokens derived directly from web-app/src/index.css
abstract class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFF16A34A); // Emerald 600
  static const Color primaryLight = Color(0xFFDCFCE7); // Emerald 100
  static const Color primaryDark = Color(0xFF14532D); // Emerald 900
  static const Color primaryHover = Color(0xFF15803D); // Emerald 700

  // Neutrals
  static const Color neutralDark = Color(0xFF111827); // Slate 900
  static const Color neutralGray = Color(0xFF6B7280); // Slate 500
  static const Color neutralLight = Color(0xFF9CA3AF); // Slate 400
  static const Color borderGray = Color(0xFFE2E8F0); // Slate 200
  static const Color borderLight = Color(0xFFF1F5F9); // Slate 100
  static const Color bgSlate = Color(0xFFF8FAFC); // Slate 50 Page Background
  static const Color surfaceWhite = Color(0xFFFFFFFF); // Card & Dialog Background

  // Accents & Decorative
  static const Color tealAccent = Color(0xFF14B8A6);
  static const Color emerald500 = Color(0xFF10B981);
  static const Color green600 = Color(0xFF16A34A);
  
  static const LinearGradient heroGradient = LinearGradient(
    colors: [emerald500, tealAccent, green600],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // Waste Stream Specific Colors
  static const Color streamWetText = Color(0xFF16A34A);
  static const Color streamWetBg = Color(0xFFDCFCE7);
  
  static const Color streamDryText = Color(0xFF2563EB);
  static const Color streamDryBg = Color(0xFFDBEAFE);
  
  static const Color streamHazardousText = Color(0xFFDC2626);
  static const Color streamHazardousBg = Color(0xFFFEE2E2);

  static const Color streamSanitaryText = Color(0xFFD97706);
  static const Color streamSanitaryBg = Color(0xFFFEF3C7);

  // Status & Feedback Colors
  static const Color successText = Color(0xFF16A34A);
  static const Color successBg = Color(0xFFDCFCE7);
  static const Color successBorder = Color(0xFFBBF7D0);

  static const Color warningText = Color(0xFFD97706);
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color warningBorder = Color(0xFDF0A500);

  static const Color dangerText = Color(0xFFDC2626);
  static const Color dangerBg = Color(0xFFFEE2E2);
  static const Color dangerBorder = Color(0xFFFCA5A5);

  static const Color infoText = Color(0xFF2563EB);
  static const Color infoBg = Color(0xFFDBEAFE);
  static const Color infoBorder = Color(0xFFBFDBFE);

  // Factory Status Specific
  static const Color statusOperationalBg = Color(0xFFDCFCE7);
  static const Color statusOperationalText = Color(0xFF16A34A);
  
  static const Color statusBusyBg = Color(0xFFFEF3C7);
  static const Color statusBusyText = Color(0xFFD97706);

  static const Color statusLimitedBg = Color(0xFFFEF9C3);
  static const Color statusLimitedText = Color(0xFFA16207);

  static const Color statusFullBg = Color(0xFFFEE2E2);
  static const Color statusFullText = Color(0xFFDC2626);

  static const Color statusMaintenanceBg = Color(0xFFFEE2E2);
  static const Color statusMaintenanceText = Color(0xFFDC2626);

  static const Color statusEmergencyBg = Color(0xFF991B1B);
  static const Color statusEmergencyText = Color(0xFFFFFFFF);
}
