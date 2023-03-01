import sys;

def funcion(num1,num2): 
    c = int(num1)+int(num2);
    return int(c);
    

print(funcion(sys.argv[1],sys.argv[2]))