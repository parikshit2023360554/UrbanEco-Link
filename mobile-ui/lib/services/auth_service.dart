import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../shared/models/models.dart';
import 'api_client.dart';

class AuthService extends ChangeNotifier {
  UserModel? _currentUser;
  String _activeRole = AppConstants.roleSociety;
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  String get activeRole => _activeRole;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  AuthService() {
    // Default initial user
    _currentUser = UserModel(
      id: 'USER-101',
      name: 'Greenwood Heights RWA',
      email: 'society@urbaneco.org',
      role: AppConstants.roleSociety,
      phone: '+91 98765 43210',
      organizationName: 'Greenwood Society RWA',
      address: 'Block B, Sector 62, Urban Eco-Zone',
    );
  }

  void setRole(String role) {
    _activeRole = role;
    if (_currentUser != null) {
      String name = 'Greenwood Heights RWA';
      if (role == AppConstants.roleDriver) {
        name = 'Vikram Singh (Logistics Lead)';
      } else if (role == AppConstants.roleFactory) {
        name = 'EcoMatrix Bio-Recycling Facility';
      } else if (role == AppConstants.roleNGO) {
        name = 'CleanCity Civic Foundation';
      }
      _currentUser = UserModel(
        id: _currentUser!.id,
        name: name,
        email: _currentUser!.email,
        role: role,
        phone: _currentUser!.phone,
        organizationName: name,
        address: _currentUser!.address,
      );
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password, String role) async {
    _isLoading = true;
    notifyListeners();

    _activeRole = role;

    // Try live Supabase Express backend
    final response = await ApiClient.post('/auth/login', {
      'email': email,
      'password': password,
      'role': role,
    });

    if (response != null && response['success'] == true) {
      final data = response['data'] ?? response['user'];
      final token = response['token'] as String?;
      if (token != null) {
        ApiClient.setAuthToken(token);
      }
      _currentUser = UserModel(
        id: data?['id']?.toString() ?? 'USER-DB',
        name: data?['name'] ?? data?['full_name'] ?? 'UrbanEco User',
        email: data?['email'] ?? email,
        role: data?['role'] ?? role,
        phone: data?['phone_number'] ?? '+91 98765 43210',
        organizationName: data?['society_name'] ?? 'UrbanEco Enterprise',
        address: data?['street_address'] ?? 'Sector 62, Eco City',
      );
    } else {
      // Offline / fallback mock mode
      await Future.delayed(const Duration(milliseconds: 300));
      _currentUser = UserModel(
        id: 'USER-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        name: role == AppConstants.roleDriver
            ? 'Rajesh Kumar (Driver)'
            : role == AppConstants.roleFactory
                ? 'EcoMatrix Recycling Facility #4'
                : role == AppConstants.roleNGO
                    ? 'Swachh Bharat Volunteer Org'
                    : 'Greenwood Heights RWA',
        email: email,
        role: role,
        phone: '+91 98765 43210',
        organizationName: 'UrbanEco Enterprise',
        address: 'Sector 62, Eco City',
      );
    }

    _isLoading = false;
    notifyListeners();
    return true;
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
    required String phone,
    String? address,
  }) async {
    _isLoading = true;
    notifyListeners();

    _activeRole = role;

    final response = await ApiClient.post('/auth/register', {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
      'phone_number': phone,
      'street_address': address ?? 'Sector 62',
      'latitude': 28.6272,
      'longitude': 77.3726,
    });

    if (response != null && response['success'] == true) {
      final data = response['data'] ?? response['user'];
      final token = response['token'] as String?;
      if (token != null) {
        ApiClient.setAuthToken(token);
      }
      _currentUser = UserModel(
        id: data?['id']?.toString() ?? 'USER-REG-DB',
        name: data?['name'] ?? name,
        email: data?['email'] ?? email,
        role: data?['role'] ?? role,
        phone: data?['phone_number'] ?? phone,
        organizationName: data?['society_name'] ?? name,
        address: data?['street_address'] ?? address ?? 'Sector 62',
      );
    } else {
      // Offline / fallback mock mode
      await Future.delayed(const Duration(milliseconds: 300));
      _currentUser = UserModel(
        id: 'USER-REG-${DateTime.now().millisecondsSinceEpoch}',
        name: name,
        email: email,
        role: role,
        phone: phone,
        organizationName: name,
        address: address ?? 'Eco-Zone Sector 12',
      );
    }

    _isLoading = false;
    notifyListeners();
    return true;
  }

  void logout() {
    _currentUser = null;
    _activeRole = AppConstants.roleSociety;
    ApiClient.setAuthToken('');
    notifyListeners();
  }
}

