import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreeToTerms = false;
  String? _selectedSocietyType;

  final List<String> _societyTypes = [
    'Apartment',
    'Gated Community',
    'RWA',
    'University Hostel'
  ];

  void _handleRegister() {
    if (_formKey.currentState!.validate() && _agreeToTerms) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else if (!_agreeToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please agree to the Terms and Conditions")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.darkText),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Top Section
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.eco, color: AppColors.primaryGreen, size: 28),
                  const SizedBox(width: 8),
                  Text(
                    "UrbanEco-Link",
                    style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                      color: AppColors.darkGreen,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                "Register Your Society",
                style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(
                  color: AppColors.darkGreen,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                "Join the green revolution 🌿",
                style: AppTheme.lightTheme.textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),

              // Benefits Row
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  _buildBenefitChip("AI Waste Tracking"),
                  _buildBenefitChip("City Leaderboard"),
                  _buildBenefitChip("Auto Matched Pickups"),
                  _buildBenefitChip("Real-time Inventory"),
                ],
              ),
              const SizedBox(height: 32),

              // Form Fields
              _buildTextField(
                hint: "e.g. Raghuma Hostel",
                icon: Icons.business,
                label: "Society Name",
                validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
              ),
              const SizedBox(height: 16),

              _buildTextField(
                hint: "e.g. Greater Noida",
                icon: Icons.location_on_outlined,
                label: "City",
                validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      hint: "201310",
                      icon: Icons.tag,
                      label: "Pincode",
                      keyboardType: TextInputType.number,
                      validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildTextField(
                      hint: "240",
                      icon: Icons.home_outlined,
                      label: "Total Units",
                      keyboardType: TextInputType.number,
                      validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              _buildDropdown(),
              const SizedBox(height: 16),

              _buildTextField(
                hint: "Admin Full Name",
                icon: Icons.person_outline,
                label: "Admin Name",
                validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
              ),
              const SizedBox(height: 16),

              _buildTextField(
                hint: "admin@yoursociety.com",
                icon: Icons.mail_outline,
                label: "Email",
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.isEmpty) return "Required";
                  if (!v.contains('@')) return "Invalid email";
                  return null;
                },
              ),
              const SizedBox(height: 16),

              _buildPhoneField(),
              const SizedBox(height: 16),

              _buildTextField(
                hint: "Password",
                icon: Icons.lock_outline,
                label: "Password",
                isPassword: true,
                obscureText: _obscurePassword,
                onToggle: () => setState(() => _obscurePassword = !_obscurePassword),
                validator: (v) => (v == null || v.length < 6) ? "Min 6 chars" : null,
              ),
              const SizedBox(height: 16),

              _buildTextField(
                hint: "Confirm Password",
                icon: Icons.lock_outline,
                label: "Confirm Password",
                isPassword: true,
                obscureText: _obscureConfirmPassword,
                onToggle: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),

              const SizedBox(height: 24),

              // Terms
              Row(
                children: [
                  Checkbox(
                    value: _agreeToTerms,
                    activeColor: AppColors.primaryGreen,
                    onChanged: (v) => setState(() => _agreeToTerms = v!),
                  ),
                  const Expanded(
                    child: Text(
                      "I agree to the Terms of Service and Privacy Policy",
                      style: TextStyle(fontSize: 12, color: AppColors.gray),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Button
              ElevatedButton(
                onPressed: _handleRegister,
                child: const Text("Create Account"),
              ),
              const SizedBox(height: 24),

              // Bottom Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Already registered? ", style: TextStyle(color: AppColors.gray)),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Text(
                      "Login",
                      style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.lightGreen,
        borderRadius: BorderRadius.circular(50),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, size: 14, color: AppColors.primaryGreen),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.darkGreen,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String hint,
    required IconData icon,
    required String label,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggle,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.darkText),
        ),
        const SizedBox(height: 8),
        TextFormField(
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, color: AppColors.primaryGreen),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      obscureText ? Icons.visibility_off : Icons.visibility,
                      color: AppColors.gray,
                    ),
                    onPressed: onToggle,
                  )
                : null,
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.lightGreen),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.lightGreen),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.dangerRed),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Society Type",
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.darkText),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedSocietyType,
          items: _societyTypes.map((type) {
            return DropdownMenuItem(value: type, child: Text(type));
          }).toList(),
          onChanged: (v) => setState(() => _selectedSocietyType = v),
          validator: (v) => v == null ? "Required" : null,
          decoration: InputDecoration(
            hintText: "Select Type",
            prefixIcon: const Icon(Icons.layers_outlined, color: AppColors.primaryGreen),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.lightGreen),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.lightGreen),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
            ),
          ),
          icon: const Icon(Icons.arrow_drop_down, color: AppColors.primaryGreen),
        ),
      ],
    );
  }

  Widget _buildPhoneField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Phone Number",
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.darkText),
        ),
        const SizedBox(height: 8),
        TextFormField(
          keyboardType: TextInputType.phone,
          validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
          decoration: InputDecoration(
            hintText: "Phone Number",
            prefixIcon: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(width: 12),
                const Icon(Icons.phone_outlined, color: AppColors.primaryGreen),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    "+91",
                    style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
              ],
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.lightGreen),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.lightGreen),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
            ),
          ),
        ),
      ],
    );
  }
}
