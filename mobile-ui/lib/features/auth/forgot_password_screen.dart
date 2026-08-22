import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Reset Password'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Forgot Password?',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.neutralDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Enter your registered email address to receive an OTP verification code.',
                  style: TextStyle(fontSize: 13, color: AppColors.neutralGray),
                ),
                const SizedBox(height: 20),
                AppTextField(
                  label: 'Registered Email',
                  hint: 'name@society.com',
                  controller: _emailController,
                  prefixIcon: LucideIcons.mail,
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'Send Verification OTP',
                  onPressed: () {
                    if (_emailController.text.contains('@')) {
                      Navigator.pushNamed(context, AppRoutes.otpVerification);
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
