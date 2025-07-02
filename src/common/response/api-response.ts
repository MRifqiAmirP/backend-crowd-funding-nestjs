export class ApiResponse {
  static success(data: any, message = 'Success') {
    return {
      status: true,
      message,
      data,
    };
  }

  static error(message = 'Error', errors: any = null) {
    return {
      status: false,
      message,
      errors,
    };
  }
}
